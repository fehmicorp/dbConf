import { fetchDb } from "../db.actions/fetch.db";
import { Response } from "../post.method/response";
import { redisData } from "../utils/header";

export async function handleWS(req: any) {
  const { query, dbConf, input } = await redisData(req);
  if (query.engine !== 'websocket') {
    return Response.error("Configuration mismatch: Expected WebSocket engine", 400);
  }
  const onMessage = async (clientPayload: any) => {
    const action = clientPayload.action || "fetch";
    const resolver = query.events?.[action]?.resolver || query.resolver;

    if (!resolver) {
      return { success: false, msg: "No resolver defined for this action" };
    }

    // Reuse the existing fetchDb logic to get data for the socket emit
    const mappedQuery = {
      ...resolver,
      engine: 'graphql', // We use graphql engine logic for dynamic filtering
      where: {
        and: clientPayload.filter ? Object.keys(clientPayload.filter) : null
      }
    };

    return await fetchDb(dbConf, mappedQuery, input, clientPayload.filter || {});
  }
  return {
    success: true,
    config: redisData,
    handler: onMessage
  };
}