export function getTransactionTime(server: any) {
	return +server.TRANS_TIME || (+server.ARESTIMEOUT || 0) + (+server.CRESTIMEOUT || 0) + (+server.RRESTIMEOUT || 0);
}