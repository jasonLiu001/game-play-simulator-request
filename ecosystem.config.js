module.exports = {
    apps: [{
        name: "GamePlayer",
        script: "./Server.js",
        cwd: "dist/",//当前工作目录
        max_memory_restart: '8G',//超过8G内存重启程序
        node_args: "--max_old_space_size=8192",
        env: {
            NODE_ENV: "production",
        },
        env_development: {
            NODE_ENV: "development",
        }
    }]
};