declare const _default: {
    app: {
        appName: string;
        environment: string;
        superSecret: string;
        baseUrl: string;
        port: string | number;
        domain: string;
    };
    api: {
        lang: string;
        prefix: string;
        versions: number[];
        patch_version: string;
        pagination: {
            itemsPerPage: number;
        };
    };
    databases: {
        sql: {
            name: string;
            user: string;
            password: string;
            host: string;
            port: number;
        };
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    options: {
        errors: {
            wrap: {
                label: string;
            };
        };
    };
};
export default _default;
//# sourceMappingURL=default.d.ts.map