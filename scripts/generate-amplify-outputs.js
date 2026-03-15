#!/usr/bin/env node
/**
 * Generates amplify_outputs.json from env vars (for manual Cognito User Pool).
 * Set in Amplify Console: AMPLIFY_USER_POOL_ID, AMPLIFY_USER_POOL_CLIENT_ID, AMPLIFY_REGION
 */
const fs = require('fs')
const path = require('path')

const poolId = process.env.AMPLIFY_USER_POOL_ID
const clientId = process.env.AMPLIFY_USER_POOL_CLIENT_ID
const region = process.env.AMPLIFY_REGION || 'eu-central-1'

if (!poolId || !clientId) {
  console.log('Skip: set AMPLIFY_USER_POOL_ID and AMPLIFY_USER_POOL_CLIENT_ID for Cognito')
  process.exit(0)
}

const config = {
  version: '1',
  auth: {
    user_pool_id: poolId,
    user_pool_client_id: clientId,
    aws_region: region,
    username_attributes: ['email'],
  },
}

const outPath = path.join(__dirname, '..', 'amplify_outputs.json')
fs.writeFileSync(outPath, JSON.stringify(config, null, 2))
console.log('Created amplify_outputs.json for Cognito')
