import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    devIndicators: false,
    env: {
        NEXT_PUBLIC_BUILD_DATE: new Date().toISOString()
    }
};

export default nextConfig;
