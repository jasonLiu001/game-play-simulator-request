module.exports = {
    apps: [{
        name: "GamePlayer",
        script: "./Server.js",
        cwd: "/dist",//当前工作目录
        max_memory_restart: '1G',//超过最大内存是重启程序
        node_args: "--max_old_space_size=8192",
        env: {
            NODE_ENV: "production",
        },
        env_development: {
            NODE_ENV: "development",
        }
    }]
};