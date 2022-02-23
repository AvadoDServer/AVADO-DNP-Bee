cd files
mkdir -p dashboard
cd dashboard
    git clone https://github.com/ethersphere/bee-dashboard.git . && \
    git checkout v0.13.0 && \
    npm ci && \
    NODE_OPTIONS=--max_old_space_size=4096 npm run build
