let AudioContextAdapter: {
    prototype: AudioContext;
    new(contextOptions?: AudioContextOptions): AudioContext;
};
if(typeof AudioContext === "undefined"){
    AudioContextAdapter = window.webkitAudioContext;
}else{
    AudioContextAdapter = AudioContext;
}

export {AudioContextAdapter};