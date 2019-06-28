export interface ICertificateDto {
    DSSERVER_ID: string;
    KEYID: string;
    KEYCERT: string | Buffer;
    KEYPWD: string;
    TRUSTCERT: string;
}