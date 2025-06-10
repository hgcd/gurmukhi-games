
const akhar = [
    "ਸ", "ਹ",
    "ਕ", "ਖ", "ਗ", "ਘ", "ਙ",
    "ਚ", "ਛ", "ਜ", "ਝ", "ਞ",
    "ਟ", "ਠ", "ਡ", "ਢ", "ਣ",
    "ਤ", "ਥ", "ਦ", "ਧ", "ਨ",
    "ਪ", "ਫ", "ਬ", "ਭ", "ਮ",
    "ਯ", "ਰ", "ਲ", "ਵ", "ੜ",
];

const imported_akhar = [
    "ਸ਼", "ਜ਼", "ਖ਼", "ਗ਼", "ਫ਼", "ਲ਼"
]

const base_vowel = [
    "ੳ", "ਅ", "ੲ",
];

const vowel_akhar = [
    "ਆ", "ਇ", "ਈ", "ਉ", "ਊ", "ਏ", "ਐ", "ਓ", "ਔ",
];

const laga_matra = [
    "ਾ", "ਿ", "ੀ", "ੁ", "ੂ", "ੇ", "ੈ", "ੋ", "ੌ",
    "ਂ", "ੰ", "ੱ"
];

const valid_chars = [" ", "-", "_"];

function splitAkharClusters(word) {
    let clusters = [];
    let currentCluster = "";

    // Iterate over each character in the word
    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        // Next char is akhar
        if ((akhar + imported_akhar + base_vowel + vowel_akhar + valid_chars).includes(char)) {
            if (currentCluster.length > 0) {
                clusters.push(currentCluster);
                currentCluster = "";
            }
            currentCluster += char;
        }
        // Next char is not akhar
        else {
            currentCluster += char;
        }
    }

    // Push last cluster
    if (currentCluster.length > 0) {
        clusters.push(currentCluster);
    }

    return clusters;
}

function shuffle(array) {
    let currentIndex = array.length;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function stripNonAkhar(word) {
    // Strip all non-akhar characters
    let stripped = "";
    for (let i = 0; i < word.length; i++) {
        if ((akhar + imported_akhar + base_vowel).includes(word[i])) {
            stripped += word[i];
        } else if (vowel_akhar.includes(word[i])) {
            if (word[i] == "ਆ" || word[i] == "ਐ" || word[i] == "ਓ") { stripped += "ਅ"; }
            else if (word[i] == "ਇ" || word[i] == "ਈ" || word[i] == "ਏ") { stripped += "ੲ"; }
            else if (word[i] == "ਉ" || word[i] == "ਊ" || word[i] == "ਓ") { stripped += "ੳ"; }
        }
    }
    return stripped;
}

function deduplicate(array) {
    return [...new Set(array)];
}

// Akhar images
const AKHAR_IMAGES = {
    "ੳ": [
        { "word": "ਉਰ", "image": ""}
    ],
    "ਅ": [
        { "word": "ਅਸ", "image": ""}
    ],
    "ੲ": [
        { "word": "ਇਸ਼ਨਾਨ", "image": ""}
    ],
    "ਸ": [
        { "word": "ਸੁਆਨ", "image": ""}
    ],
    "ਹ": [
        { "word": "ਹਰਿਮੰਦਰ ਸਾਹਿਬ", "image": ""}
    ],
    "ਕ": [
        { "word": "ਕੜਾ", "image": ""}
    ],
    "ਖ": [
        { "word": "ਖੰਡਾ", "image": ""}
    ],
    "ਗ": [
        { "word": "ਗਤਕਾ", "image": ""}
    ],
    "ਘ": [
        { "word": "ਘੜਾ", "image": ""}
    ],
    "ਙ": [
        { "word": "ਲੰਙਾ", "image": ""}
    ],
    "ਚ": [
        { "word": "ਚਰਨ", "image": ""}
    ],
    "ਛ": [
        { "word": "ਛੱਲੀ", "image": ""}
    ],
    "ਜ": [
        { "word": "ਜੂੜਾ", "image": ""}
    ],
    "ਝ": [
        { "word": "ਝਰਨਾ", "image": ""}
    ],
    "ਞ": [
        { "word": "ਤ੍ਰਿੰਞਣ", "image": ""}
    ],
    "ਟ": [
        { "word": "ਟਾਂਗਾ", "image": ""}
    ],
    "ਠ": [
        { "word": "ਠੂਠੀ", "image": ""}
    ],
    "ਡ": [
        { "word": "ਡਮਰੂ", "image": ""}
    ],
    "ਢ": [
        { "word": "ਢਾਲ", "image": ""}
    ],
    "ਣ": [
        { "word": "ਪਾਣੀ", "image": ""}
    ],
    "ਤ": [
        { "word": "ਤਬਲਾ", "image": ""}
    ],
    "ਥ": [
        { "word": "ਥੈਲਾ", "image": ""}
    ],
    "ਦ": [
        { "word": "ਦਸਤਾਰ", "image": ""}
    ],
    "ਧ": [
        { "word": "ਧਵਲ", "image": ""}
    ],
    "ਨ": [
        { "word": "ਨਗਾਰਾ", "image": ""}
    ],
    "ਪ": [
        { "word": "ਪੋਥੀ", "image": ""}
    ],
    "ਫ": [
        { "word": "ਫੁਲਕਾ", "image": ""}
    ],
    "ਬ": [
        { "word": "ਬਾਟਾ", "image": ""}
    ],
    "ਭ": [
        { "word": "ਭੁਝੰਗੀ", "image": ""}
    ],
    "ਮ": [
        { "word": "ਮੀਨ", "image": ""}
    ],
    "ਯ": [
        { "word": "ਯੋਧਾ", "image": ""}
    ],
    "ਰ": [
        { "word": "ਰਸਨਾ", "image": ""}
    ],
    "ਲ": [
        { "word": "ਲੰਗਰ", "image": ""}
    ],
    "ਵ": [
        { "word": "ਵਹਿਗੁਰੂ", "image": ""}
    ],
    "ੜ": [
        { "word": "ਦੌੜ", "image": ""}
    ]
}

function getAkharImages(akhar) {
    defaultImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Tursiops_truncatus_01.jpg/500px-Tursiops_truncatus_01.jpg";
    akharImages = [];
    // Loop through all akhar images
    for (let [key, value] of Object.entries(AKHAR_IMAGES)) {
        if (key == akhar) {
            if (true) {
                akharImages.push({
                    "word": "-",
                    "image": defaultImage,
                });
            } else {
                akharImages.push(value);
            }
        }
    }
    return akharImages;
}

// Audio paths
const PAINTI_AKHAR_AUDIO = {
    ੳ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/ooda.mp3?alt=media&token=01f217eb-5972-4218-9b0a-8092cf6ce832"),
    ਅ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/aada.mp3?alt=media&token=6da9e0eb-9eaa-4df4-ad09-256f6c07789f"),
    ੲ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/eedee.mp3?alt=media&token=77723ce6-7bd3-400f-b511-e78a768e7aba"),
    ਸ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/sasa.mp3?alt=media&token=d4952204-c887-4ae6-a248-9267fd2f0bd3"),
    ਹ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/haha.mp3?alt=media&token=32c5b2d5-e0ff-40fb-9fac-c9c1ecc74923"),

    ਕ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/kaka.mp3?alt=media&token=434ba87d-f9f2-45f5-8de0-4a7c1743ed02"),
    ਖ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/khakha.mp3?alt=media&token=e48faa60-5087-4f69-8f8e-43bee5e267cc"),
    ਗ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/gaga.mp3?alt=media&token=a25c7f93-6ede-4fd1-bb00-2eaa12584e09"),
    ਘ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/ghaga.mp3?alt=media&token=c1e149e8-2be2-47e0-8443-311b1d655817"),
    ਙ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/nganga.mp3?alt=media&token=fd9581ce-0e71-4c96-9464-dab9c9538f46"),

    ਚ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/chacha.mp3?alt=media&token=3dd93128-bf19-41e2-8b69-9fe46b2c7d43"),
    ਛ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/chhachha.mp3?alt=media&token=c9679115-9dd1-4557-ab0e-65ef0d5b0cf6"),
    ਜ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/jaja.mp3?alt=media&token=786ec69f-e277-4a04-83fc-811eb1ef28d2"),
    ਝ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/jhaja.mp3?alt=media&token=4b057308-f6d7-41c5-b704-1e8ee8b9ef46"),
    ਞ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/nyanya.mp3?alt=media&token=31779d18-b6b4-470f-83ba-26998756f141"),

    ਟ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/ttanka.mp3?alt=media&token=64a40979-dfb0-42e0-b4e0-4541394bb121"),
    ਠ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/tthattha.mp3?alt=media&token=1e00e91c-2eb0-487c-b804-a2b638edb6cf"),
    ਡ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/ddadda.mp3?alt=media&token=3da6ec5b-8651-4121-b2ed-bf53a1a4a4de"),
    ਢ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/tdada.mp3?alt=media&token=7647c6d2-c614-4e18-860c-279d7ed49176"),
    ਣ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/nnanna.mp3?alt=media&token=9bdffce7-00d0-4c5e-805b-e3792a17cf18"),

    ਤ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/tata.mp3?alt=media&token=cc4508b8-3318-4ce9-a92d-c9d5026e5df6"),
    ਥ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/thatha.mp3?alt=media&token=22627b25-d070-46bf-84ad-36a47524f87d"),
    ਦ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/dada.mp3?alt=media&token=328ae384-d601-4253-ac89-83e96445dfe4"),
    ਧ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/dhada.mp3?alt=media&token=df0024de-1c3e-4ed8-8efc-32af0a547a6f"),
    ਨ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/nana.mp3?alt=media&token=41df7b61-dab3-4272-b71b-ce602558e66e"),
        
    ਪ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/papa.mp3?alt=media&token=dffbbd30-c2f4-49d7-85c9-2b7f755ad71d"),
    ਫ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/phapha.mp3?alt=media&token=7bf0464c-1871-4016-a35e-d693382a0fef"),
    ਬ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/baba.mp3?alt=media&token=4838d52f-3d8c-4948-b9f6-8884c6c6158c"),
    ਭ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/bhaba.mp3?alt=media&token=aa6852d8-cc89-4670-b9b6-f14d31b6572f"),
    ਮ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/mama.mp3?alt=media&token=550e3815-689d-4bbe-8ce7-a605af4236c9"),

    ਯ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/yaya.mp3?alt=media&token=b96c1224-757d-44b0-8c41-a1a91f26ef09"),
    ਰ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/rara.mp3?alt=media&token=aa96d428-10fc-42ec-9b03-579767f58638"),
    ਵ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/vava.mp3?alt=media&token=3a5d325f-cd53-45a1-8aa1-88e0c074b832"),
    ਲ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/lala.mp3?alt=media&token=71911ac2-c0c4-40fd-88a7-f94df3ad620c"),
    ੜ: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/rdarda.mp3?alt=media&token=6ecf55aa-e62d-4a50-b825-e5f378f89c41"),
};

const IMPORTED_AKHAR_AUDIO = {
    ਸ਼: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/sase_par_bindi.mp3?alt=media&token=e363a741-7eed-4809-8c87-dd935a32057e"),
    ਖ਼: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/khake_par_bindi.mp3?alt=media&token=9519833d-33f2-48aa-b28f-73bd03a19ca6"),
    ਗ਼: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/gage_par_bindi.mp3?alt=media&token=e1ffaf14-6b61-45de-a16e-d00a3985d6a6"),
    ਜ਼: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/jaje_par_bindi.mp3?alt=media&token=901bb297-dd2a-422f-944f-029477b5d168"),
    ਫ਼: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/phaphe_par_bindi.mp3?alt=media&token=3b051b71-0186-41c8-8a6b-0231ac7b2b6b"),
    ਲ਼: new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/lale_par_bindi.mp3?alt=media&token=cef82db0-bd46-4d92-bb22-449ef3c16911"),
}

const LAGA_MATRA_AUDIO = {
    "ਾ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/kana.mp3?alt=media&token=53cc9d90-21cd-4159-a9ac-dcfb8b2354d5"),
    "ੁ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/onkd.mp3?alt=media&token=795500f0-aa45-4dec-9a32-2e2a8ba06844"),
    "ੂ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/dalankd.mp3?alt=media&token=63b0ad96-b945-4ee5-8af1-7bc7ff7c3be5"),
    "ਿ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/siharee.mp3?alt=media&token=6fcf7eae-1f27-4adb-9159-4a1053737db2"),
    "ੀ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/biharee.mp3?alt=media&token=832d5f29-96ee-48c4-a3be-7bd81372e127"),
    "ੇ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/lam.mp3?alt=media&token=7e3fe830-ed1a-47db-8acd-b539d3969398"),
    "ੈ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/dalama.mp3?alt=media&token=375de7c7-0b56-4468-b4e4-9626d1464b7b"),
    "ੋ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/hoda.mp3?alt=media&token=5992c451-c251-4ae4-a672-bc1e0211ea28"),
    "ੌ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/knauda.mp3?alt=media&token=3ee7680f-b27c-41bc-bdfc-677d13e77d5e"),

    "ੰ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/tipi.mp3?alt=media&token=015c8547-9d11-4359-96b9-d04d19ea9fb3"),
    "ਅ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/mukta.mp3?alt=media&token=3a1d43a0-78b0-45d7-aa7a-276cb757c6c5"),
    "ਂ": new Audio("https://firebasestorage.googleapis.com/v0/b/punjabi-app-2023.appspot.com/o/bindi.mp3?alt=media&token=b68b5f70-97f9-40e1-8674-9272c66a18f1"),
}