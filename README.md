# Nomad Poster

This is a simple script to post on [Nomad](https://nmd.co)

### Example

```javascript
const Nomad = require('nomad-poster');

const nomad = new Nomad('my-hns-domain', 'that-private-key-you-should-have–a-backup');
nomad.post('Yet another automated post');
```