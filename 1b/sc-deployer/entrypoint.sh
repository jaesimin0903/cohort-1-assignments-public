#!/bin/sh

set -e

echo "🚀 Starting smart contract deployment..."

# Wait for geth-init to complete prefunding
echo "⏳ Waiting for geth-init to complete prefunding..."
until [ -f "/shared/geth-init-complete" ]; do
  echo "Waiting for geth-init-complete file..."
  sleep 1
done
echo "✅ Prefunding completed, proceeding with deployment..."

# Clean up and clone repository fresh
echo "🧹 Cleaning up previous repository..."
rm -rf /workspace/cohort-1-assignments-public

cd /workspace

echo "📥 Cloning repository..."
if [ -d "cohort-1-assignments-public" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd cohort-1-assignments-public
    git pull origin main
else
    git clone https://github.com/jaesimin0903/cohort-1-assignments-public.git
    cd cohort-1-assignments-public
fi

git checkout feature/cjm
# Navigate to the 1a directory
cd 1a

# Install dependencies
echo "📦 Installing dependencies..."
forge install

# Build the project
echo "🔨 Building project..."
forge build

# Deploy the contracts
echo "🚀 Deploying MiniAMM contracts..."
echo "📋 Current directory: $(pwd)"
echo "📋 Files in current directory:"
ls -la

echo "🔍 Testing geth connection..."
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://geth:8545 || echo "❌ Failed to connect to geth"

echo "🚀 Running forge script..."
echo "🔍 Checking network info..."
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' http://geth:8545

echo "🚀 Running forge script with explicit chain ID..."
forge script script/MiniAMM.s.sol:MiniAMMScript \
    --rpc-url http://geth:8545 \
    --private-key be44593f36ac74d23ed0e80569b672ac08fa963ede14b63a967d92739b0c8659 \
    --broadcast \
    --chain-id 1337 \
    --legacy \
    --verbosity 2

echo "📋 Checking if broadcast folder was created..."
if [ -d "broadcast" ]; then
    echo "✅ Broadcast folder exists!"
    find broadcast -type f -name "*.json" | head -10
else
    echo "❌ Broadcast folder not found!"
    echo "📋 Current directory contents after deployment:"
    ls -la
fi

echo "✅ Deployment completed!"
echo ""
echo "📊 Contract addresses should be available in the broadcast logs above."

# Extract contract addresses to deployment.json
echo "📝 Extracting contract addresses..."
cd /workspace
node extract-addresses.js

echo "✅ All done! Check deployment.json for contract addresses."
