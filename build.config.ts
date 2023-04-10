import { defineBuildConfig } from "unbuild";
import { devDependencies } from "./package.json";

export default defineBuildConfig({
    declaration: true,
    entries: [{ input: "./src/index", format: "esm", declaration: true }],
    rollup: {
        inlineDependencies: true,
        esbuild: {
            minify: true,
        },
    },
});
