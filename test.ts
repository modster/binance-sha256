import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.179.0/crypto/crypto.ts";
import { toHashString } from "https://deno.land/std@0.179.0/crypto/to_hash_string.ts"

const hash = await crypto.subtle.digest("SHA-384", new TextEncoder().encode("You hear that Mr. Anderson?"));

// [object ArrayBuffer]
console.log('fn: hash                         ' + hash)
// Hex encoding by default
console.log('fn: toHashString(hash)           ' + toHashString(hash));

// // Or with base64 encoding
console.log('fn: toHashString(hash, "base64") ' + toHashString(hash, "base64"));

serve((req: Request) => Response.json({ message: "Hello World" }));
