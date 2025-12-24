import { Response } from './response';
import { ResultDataTypes, ResultType } from "../utils/data.type";

export default function sendResponse(result: ResultType) {
  const success = result.success;
  const msg = result.msg ? result.msg : null;
  const data = result.data ? result.data : null;
  const error = result.error ? result.error : null;
  const code = success ? 200 : msg ? 200 : (error as { code?: number })?.code ?? 400;
  switch (success){
    case true:
      return Response.res(success, msg, data, code);

    case false:
      return Response.res(success, msg, error as ResultDataTypes, code);

    default:
      return Response.res(false, "Server Error", null, 500);
  }
}