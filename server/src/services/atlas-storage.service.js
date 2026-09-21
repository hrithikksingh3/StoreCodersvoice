const axios = require('axios');

const ATLAS_BASE_URL = 'https://cloud.mongodb.com';
const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedUsage = null;

const configuration = () => ({
  projectId: process.env.ATLAS_PROJECT_ID,
  clientId: process.env.ATLAS_SERVICE_ACCOUNT_CLIENT_ID,
  clientSecret: process.env.ATLAS_SERVICE_ACCOUNT_SECRET,
  processId: process.env.ATLAS_PROCESS_ID,
});

exports.isConfigured = () => {
  const { projectId, clientId, clientSecret } = configuration();
  return Boolean(projectId && clientId && clientSecret);
};

const requestToken = async ({ clientId, clientSecret }) => {
  const basicCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await axios.post(`${ATLAS_BASE_URL}/api/oauth/token`, 'grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${basicCredentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    timeout: 8000,
  });
  if (!response.data?.access_token) throw new Error('Atlas did not return an access token.');
  return response.data.access_token;
};

const atlasGet = async (path, token, params) => (await axios.get(`${ATLAS_BASE_URL}${path}`, {
  params,
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.atlas.2025-03-12+json' },
  timeout: 8000,
})).data;

const resolveProcess = async (projectId, token, configuredProcessId) => {
  if (configuredProcessId) return configuredProcessId;
  const response = await atlasGet(`/api/atlas/v2/groups/${encodeURIComponent(projectId)}/processes`, token, { itemsPerPage: 500 });
  const primaryProcesses = (response.results || []).filter((process) => ['REPLICA_PRIMARY', 'SHARD_PRIMARY', 'SHARD_STANDALONE'].includes(process.typeName));
  if (primaryProcesses.length === 1) return primaryProcesses[0].id;
  if (!primaryProcesses.length) throw new Error('Atlas returned no primary process with available metrics.');
  throw new Error('More than one Atlas primary process was found. Set ATLAS_PROCESS_ID for this store cluster.');
};

exports.getAtlasStorageUsage = async () => {
  if (!exports.isConfigured()) return null;
  if (cachedUsage && Date.now() - cachedUsage.cachedAt < CACHE_TTL_MS) return cachedUsage;
  const config = configuration();
  const token = await requestToken(config);
  const processId = await resolveProcess(config.projectId, token, config.processId);
  const disks = await atlasGet(
    `/api/atlas/v2/groups/${encodeURIComponent(config.projectId)}/processes/${encodeURIComponent(processId)}/disks`,
    token,
    { itemsPerPage: 500 },
  );
  const partitionName = (disks.results || []).map((disk) => disk.partitionName || disk.name).find(Boolean);
  if (!partitionName) throw new Error('Atlas returned no disk partition for the selected process.');
  const response = await atlasGet(
    `/api/atlas/v2/groups/${encodeURIComponent(config.projectId)}/processes/${encodeURIComponent(processId)}/disks/${encodeURIComponent(partitionName)}/measurements`,
    token,
    { m: 'DISK_PARTITION_SPACE_USED', granularity: 'PT1H', period: 'P1D' },
  );
  const metric = (response.measurements || []).find((item) => item.name === 'DISK_PARTITION_SPACE_USED');
  const points = (metric?.dataPoints || []).filter((point) => Number.isFinite(Number(point.value)));
  if (!points.length) {
    return { unavailable: true, processId, reason: 'Atlas did not provide sampled disk-usage values for this cluster tier.' };
  }
  const latest = points.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  cachedUsage = { usedBytes: Number(latest.value), observedAt: latest.timestamp, processId, cachedAt: Date.now() };
  return cachedUsage;
};
