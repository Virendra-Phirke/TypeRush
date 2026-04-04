const fs = require('fs');
const https = require('https');

https.get('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const engWords = data.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length > 0 && w.length < 30);
        
        const techWords = [
            "function", "const", "let", "var", "boolean", "string", "number", "array", "object", "undefined", "null", "promise", "async", "await", "import", "export", "class", "interface", "type", "public", "private", "protected", "extends", "implements", "constructor", "super", "this", "console", "log", "error", "warn", "info", "document", "window", "event", "listener", "timeout", "interval", "request", "response", "header", "body", "status", "json", "parse", "stringify", "map", "filter", "reduce", "forEach", "includes", "indexOf", "push", "pop", "shift", "unshift", "splice", "slice", "concat", "join", "reverse", "sort", "keys", "values", "entries", "assign", "create", "freeze", "length", "name", "prototype", "module", "require", "exports", "process", "global", "buffer", "stream", "crypto", "http", "https", "fs", "path", "os", "url", "events", "util", "react", "component", "next", "state", "props", "hook", "effect", "memo", "callback", "context", "reducer", "ref", "layout", "render", "mount", "unmount", "dom", "node", "element", "fragment", "portal", "children", "provider", "consumer", "router", "route", "link", "nav", "query", "param", "match", "history", "location", "action", "dispatch", "store", "middleware", "thunk", "saga", "redux", "api", "endpoint", "graphql", "rest", "webhook", "socket", "websocket", "fetch", "axios", "cors", "csrf", "jwt", "oauth", "auth", "session", "cookie", "storage", "local", "cache", "sql", "nosql", "mongo", "postgres", "mysql", "redis", "docker", "container", "image", "volume", "network", "compose", "kubernetes", "pod", "deployment", "service", "ingress", "configmap", "secret", "namespace", "cluster", "aws", "azure", "gcp", "cloud", "lambda", "ec2", "rds", "vpc", "iam", "role", "policy", "permission", "queue", "topic", "stream", "kafka", "rabbitmq"
        ];
        
        const uniqueWords = Array.from(new Set([...engWords, ...techWords]));
        fs.writeFileSync('public/zenDictionary.json', JSON.stringify(uniqueWords));
        console.log('Dictionary built in public/zenDictionary.json: ' + uniqueWords.length + ' words');
    });
}).on('error', console.error);
