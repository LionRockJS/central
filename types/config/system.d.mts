declare const _default: {
    debug: boolean;
    serve_static_file: boolean;
    platform: {
        adapter: {
            setup: () => Promise<{
                listen: (port: any) => void;
            }>;
        };
    };
};
export default _default;
