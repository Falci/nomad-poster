const axios = require('axios');
const secp256k1 = require('secp256k1');
const client = axios.create({ baseURL: 'https://api.nmd.co'})

const getInfo = (name) => client.get(`/blob/${name}/info`).then(r => r.data.payload);
const getBody = (tld, body, offset) => ({tld, post: {title: "", subtype: "", body, reference: "", topic: "", tags: []}, offset, truncate: false})
const preCommit = (name, text, offset) => client.post('/relayer/precommit', getBody(name, text, offset)).then(r => r.data.payload)
const commit = (name, pre, offset, sig) => client.post('/relayer/commit', {
    ...getBody(name, pre.envelope.message.body, offset),
    date: pre.envelope.timestamp,
    sealedHash: pre.sealedHash,
    sig, refhash: pre.refhash,
})

const sign = (data, pk) => {
    const sig = secp256k1.sign(Buffer.from(data, 'hex'), Buffer.from(pk, 'base64'));
    return Buffer.concat([ Buffer.from([sig.recovery + 27]), sig.signature]);
}

module.exports = class Nomad {
    constructor(name, pk) {
        this.name = name;
        this.pk = pk;
    }

    async post(text) {
        const info = await getInfo(this.name);
        const pre = await preCommit(this.name, text, info.offset);
        const sig = sign(pre.sealedHash, this.pk).toString('hex');
    
        return commit(this.name, pre, info.offset, sig);
    }
}