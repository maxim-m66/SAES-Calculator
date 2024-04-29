Sbox = [
    [0x9, 0x4, 0xA, 0xB],
    [0xD, 0x1, 0x8, 0x5],
    [0x6, 0x2, 0x0, 0x3],
    [0xC, 0xE, 0xF, 0x7],
]

M = [0, 2, 2, 0]

poly = 0b0011

function s_replace(byte) {
    let l = byte >> 2
    let r = byte & 0b11
    return Sbox[l][r]
}

function g(half, rcon) {
    let newhalf = [half[1], half[0]]
    newhalf[0] = s_replace(newhalf[0])
    newhalf[1] = s_replace(newhalf[1])
    newhalf[0] ^= rcon[0]
    newhalf[1] ^= rcon[1]
    return newhalf
}

function expand_key(key, rcon) {
    let nextkey = []
    let right = key.slice(2, 4)
    let gright = g(right, rcon)
    nextkey = [key[0] ^ gright[0], key[1] ^ gright[1]]
    nextkey.push(key[2] ^ nextkey[0])
    nextkey.push(key[3] ^ nextkey[1])
    return nextkey
}

function stringify(arr) {
    let string = []
    for (let i = 0; i < arr.length; i++) {
        string.push(arr[i].toString(16).toUpperCase())
    }
    return string
}

function add_key(A, K) {
    let B = []
    for (let i = 0; i < 4; i++) {
        B.push(A[i] ^ K[i])
    }
    return B
}

function nibble_sub(A) {
    let B = []
    for (let i = 0; i < 4; i++) {
        B.push(s_replace(A[i]))
    }
    return B
}

function shift_rows(A) {
    let B = [A[0], A[3], A[2], A[1]]
    return B
}

function multiply(val, shift) {
    for (let i = 0; i < 2; i++) {
        while (shift[i] > 0) {
            val[i] <<= 1
            shift[i]--
            if ((val[i] & 0b10000) === 0) continue;
            val[i] &= 0b1111
            val[i] ^= poly
        }
    }
    return val[0] ^ val[1]
}

function mix_columns(A) {
    let B = []
    B.push(multiply([A[0], A[1]], [M[0], M[2]]))
    B.push(multiply([A[0], A[1]], [M[1], M[3]]))
    B.push(multiply([A[2], A[3]], [M[0], M[2]]))
    B.push(multiply([A[2], A[3]], [M[1], M[3]]))
    return B
}

function check(string, len) {
    if (string.length !== len) {
        return false
    }
    for (let i = 0; i < len; i++) {
        if (isNaN(parseInt(string[i], 16))) {
            return false
        }
    }
    return true
}

function saes() {
    let good = true
    var Astring = $("#plaintext").val();
    if (!check(Astring, 4)) {
        $("#plaintext").val("loš unos");
    }
    var keystring = $("#key0").val();
    if (!check(keystring, 4)) {
        $("#key0").val("loš unos");
    }
    var rcon1string = $("#rcon1").val();
    if (!check(rcon1string, 2)) {
        $("#rcon1").val("loš unos");
    }
    var rcon2string = $("#rcon2").val();
    if (!check(rcon2string, 2)) {
        $("#rcon2").val("loš unos");
    }
    if ($("#rcon2").val() === "loš unos" || $("#rcon1").val() === "loš unos" || $("#key0").val() === "loš unos" || $("#plaintext").val() === "loš unos") {
        return
    }
    var A = [], K0 = [], K1, K2, rcon1 = [], rcon2 = [];
    for (let i = 0; i < 2; i++) {
        rcon1.push(parseInt(rcon1string[i], 16))
        rcon2.push(parseInt(rcon2string[i], 16))
    }
    for (let i = 0; i < 4; i++) {
        A.push(parseInt(Astring[i], 16))
        K0.push(parseInt(keystring[i], 16))
    }
    K1 = expand_key(K0, rcon1)
    $("#key1").val(stringify(K1).join(""))
    K2 = expand_key(K1, rcon2)
    $("#key2").val(stringify(K2).join(""))
    A = add_key(A, K0)
    $("#add_key0").val(stringify(A).join(""))
    A = nibble_sub(A)
    $("#nibble_substitution1").val(stringify(A).join(""))
    A = shift_rows(A)
    $("#shift_rows1").val(stringify(A).join(""))
    A = mix_columns(A)
    $("#mix_columns1").val(stringify(A).join(""))
    A = add_key(A, K1)
    $("#add_key1").val(stringify(A).join(""))
    A = nibble_sub(A)
    $("#nibble_substitution2").val(stringify(A).join(""))
    A = shift_rows(A)
    $("#shift_rows2").val(stringify(A).join(""))
    A = add_key(A, K2)
    $("#add_key2").val(stringify(A).join(""))
    $("#ciphertext").val(stringify(A).join(""))
}

function reset() {
    $('textarea').val("")
    $('input').val('')
}
