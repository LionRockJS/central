export default class HelperCrypto {
    static CRYPTO_ALGORITHMS: {
        RSASSA_PKCS1_v1_5: string;
        RSA_PSS: string;
        ECDSA: string;
        HMAC: string;
        RSA_OAEP: string;
        AES_CTR: string;
        AES_CBC: string;
        AES_GCM: string;
        SHA1: string;
        SHA256: string;
        SHA384: string;
        SHA512: string;
        ECDH: string;
        HKDF: string;
        PBKDF2: string;
        AES_KW: string;
    };
    static makeSignKey(algorithm?: any): Promise<any>;
    static sign(jwk: any, data: string, algorithm?: any, expire?: number, timestamp?: number): Promise<string>;
    static verify(jwk: any, sign: string, data: string, algorithm?: any, timestamp?: number): Promise<boolean>;
}
