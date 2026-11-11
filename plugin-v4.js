
(function () {
    'use strict';

    var ID = 'lampa_ptbr_audio_v3';

    if (window[ID]) return;
    window[ID] = true;

    var enabled = true;
    var active = false;
    var selected = false;
    var attempts = 0;

    function normalize(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/_/g, '-')
            .trim();
    }

    function isPTBR(track) {
        var values = [
            track.language,
            track.lang,
            track.label,
            track.name
        ];

        for (var i = 0; i < values.length; i++) {
            var value = normalize(values[i]);

            if (/pt-br|pob|por-br|brazilian|brasileir/.test(value)) {
                return true;
            }
        }

        return false;
    }

    function selectAudio() {
        if (!enabled || !active || selected) return false;

        try {
            var video = Lampa.PlayerVideo.video();

            if (!video || !video.audioTracks) return false;

            var tracks = video.audioTracks;
            var best = -1;

            for (var i = 0; i < tracks.length; i++) {
                if (isPTBR(tracks[i])) {
                    best = i;
                    break;
                }
            }

            if (best === -1) return false;

            for (var j = 0; j < tracks.length; j++) {
                tracks[j].enabled = (j === best);
            }

            selected = true;

            console.log('[PT-BR V3] Faixa selecionada:', best);
            return true;

        } catch (error) {
            console.log('[PT-BR V3] Erro:', error);
            return false;
        }
    }

    function onStart() {
        active = true;
        selected = false;
        attempts = 0;

        function check() {
            if (!active || selected) return;

            attempts++;

            if (!selectAudio() && attempts < 20) {
                setTimeout(check, 1000);
            }
        }

        check();
    }

    function onDestroy() {
        active = false;
        selected = false;
        attempts = 0;
    }

    function init() {
        if (!Lampa.Player || !Lampa.PlayerVideo) return;

        Lampa.Player.listener.follow('start', onStart);
        Lampa.Player.listener.follow('destroy', onDestroy);

        console.log('[Lampa PT-BR Audio V3] Inicializado');
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') init();
        });
    }
})();
