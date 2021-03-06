const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "MUSIC_PLAYER"

const player = $('.player')
const dashboard = $('.dashboard')
const heading = $('header h2')
const cd = $('.cd')
const cdWidth = cd.offsetWidth
const cdThumb = $('.cd-thumb')
const control = $('.control')
const btnLoop = $('.btn-repeat')
const btnPrev = $('.btn-prev')
const btnPlay = $('.btn-play')
const btnNext = $('.btn-next')
const btnRandom = $('.btn-random')
const volume = $('.btn-volume')
const volumeProgress = $('.volume-progress')
const timeCurrent = $('.time-current')
const timeDuration = $('.time-duration')
const progress = $('#progress')
const audio = $('#audio')
const playlist = $(".playlist");
 
const app = {
    songs: [
        {
            name: 'Peaches',
            author: 'Justin Bieber, Daniel Caesar, Giveon',
            audio: './MP3/Peaches.mp3',
            img: './IMG/peaches.jpg'
        },
        {
            name: 'Kiss Me More',
            author: 'Doja Cat, SZA',
            audio: './MP3/KissMeMore.mp3',
            img: './IMG/kissmemore.jpg'
        },
        {
            name: 'Save Your Tears (Remix)',
            author: 'The Weeknd, Ariana Grande',
            audio: './MP3/SaveYourTears.mp3',
            img: './IMG/saveyourtears.jpg'
        },
        {
            name: 'Montero (Call Me By Your Name)',
            author: 'Lil Nas X',
            audio: './MP3/Montero.mp3',
            img: './IMG/montero.jpg'
        },
        {
            name: 'Deja Vu',
            author: 'Olivia Rodrigo',
            audio: './MP3/DejaVu.mp3',
            img: './IMG/dejavu.jpg'
        }
    ],
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isLoop: false,
    isMute: false,
    volume: 1,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function(){
        htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === Number(this.currentIndex) ? 'active' : ''}" index="${index}">
            <div class="thumb" style="background-image: url(${song.img})">
            </div>
            <div class="body">
                <div class="songname">
                    ${song.name}
                </div>
                <div class="author">
                    ${song.author}
                </div>
            </div>
            <div class="options">
                <i class="fas fa-ellipsis-h"></i>
                <div class="options__nav">
                    <div class="detele">
                        Xo??a
                    </div>
                </div>
            </div>
        </div>
        `
        })
        playlist.innerHTML = htmls.join('')
    },
    definedProperties(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function(){
        const _this = this
        // pho??ng to thu nho?? CD
        document.onscroll = function(){
            const scrolling = window.scrollY ||document.documentElement.scrollTop
            const newCd = cdWidth - scrolling
            cd.style.width = newCd > 0 ? newCd + 'px' : '0px'
            cdThumb.style.opacity = newCd/cdWidth
        }
        // Quay CD khi play
        cdThumbAnimation = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        // m????c ??inh k quay CD
        cdThumbAnimation.pause()
        // khi click btn Play
        btnPlay.onclick = function(){
            // N????u ??ang cha??y => d????ng
            if(_this.isPlaying){
                cdThumbAnimation.pause()
                audio.pause()
            }else{
                cdThumbAnimation.play()
                audio.play()
            }
        }
        // khi song cha??y
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
        }
        // khi song d????ng
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
        }
        // khi ti????n ?????? ba??i ha??t thay ??????i
        audio.ontimeupdate = function(){
            currentTime = _this.seconds_to_mins(audio.currentTime)
            duration = _this.seconds_to_mins(audio.duration)
            timeCurrent.innerText = `${currentTime}`
            timeDuration.innerText = `${duration}`
            progress.max = audio.duration
            progress.value = audio.currentTime
        }
        // khi clink btn Repeat
        btnLoop.onclick = function(){
            if(_this.isLoop){
                _this.isLoop = false
                audio.loop = false
                btnLoop.classList.remove('active')
            }else{
                _this.isRandom = false
                _this.isLoop = true
                audio.loop = true
                btnRandom.classList.remove('active')
                btnLoop.classList.add('active')
            }
            _this.setConfig('isLoop', _this.isLoop)
            _this.setConfig('isRandom', _this.isRandom)
        }
        // khi click btn Prev
        btnPrev.onclick = function(){
            if(_this.isRandom){
                _this.randomSong()
            }else if (_this.isLoop){
                _this.loadCurrentSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            cdThumbAnimation.play()
            _this.setConfig('currentIndex', _this.currentIndex)
        }
        // khi click btn Next
        btnNext.onclick = function(){
            if(_this.isRandom){
                _this.randomSong()
            }else if (_this.isLoop){
                _this.loadCurrentSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            cdThumbAnimation.play()
            _this.setConfig('currentIndex', _this.currentIndex)
        }
        // khi click btn random => x???? ly?? b????t t????t random mode
        btnRandom.onclick = function(){
            if(_this.isRandom){
                _this.isRandom = false
                btnRandom.classList.remove('active')
            }else{
                _this.isRandom = true
                _this.isLoop = false
                audio.loop = false
                btnLoop.classList.remove('active')
                btnRandom.classList.add('active')
            }
            _this.setConfig('isRandom', _this.isRandom)
            _this.setConfig('isLoop', _this.isLoop)
            _this.setConfig('currentIndex', _this.currentIndex)
        }
        // khi cho??n volume icon
        volume.onclick = function(){
            _this.isMute = !_this.isMute
            volume.classList.toggle('mute', _this.isMute)
            _this.isMute ? audio.volume = 0 : audio.volume = _this.volume
            _this.setConfig('volume', _this.isMute ? 0 : _this.volume)
            _this.setConfig('isMute', isMute)
        }
        // khi cho??n thanh volume
        volumeProgress.onchange = function(){
            _this.volume = volumeProgress.value / 100
            audio.volume = _this.volume
            _this.isMute = false
            _this.setConfig('volume', _this.volume)
            _this.setConfig('isMute', _this.isMute)
        }
        // khi clink progress, chuy????n ??????n ??oa??n click
        progress.onchange = function(){
            audio.currentTime = progress.value
        }
        // x???? ly?? khi audio ended
        audio.onended = function(){
            if(_this.isRandom){
                _this.randomSong()
            }else if(_this.isLoop){

            }
            else{
                _this.nextSong()
            }
            audio.play()
            cdThumbAnimation.play()
        }
        // khi click vao playlist
        playlist.onclick = function(e){
            const songPlaying = document.querySelector('.song.active')
            const song = e.target.closest('.song')
            if(!e.target.closest('.options')){
                if(song !== songPlaying){
                    song.classList.add('active')
                    songPlaying.classList.remove('active')
                    _this.currentIndex = song.getAttribute('index')
                    _this.loadCurrentSong()
                    audio.play()
                }
            }else{
                optionsNav = playlist.querySelector()
                // console.log(e.target)
                console.log(optionsNav)
            }
             
            _this.setConfig('currentIndex', _this.currentIndex)
        }
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.img})`
        audio.src = this.currentSong.audio
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isLoop = this.config.isLoop
        this.currentIndex = this.config.currentIndex ? this.config.currentIndex : 0 
        
        this.volume = this.config.volume ? this.config.volume : 1
        audio.volume = this.volume
        volumeProgress.value = audio.volume * 100
        // console.log(volumeProgress.value)
        btnRandom.classList.toggle('active', this.isRandom ? true: false)
        btnLoop.classList.toggle('active', this.isLoop ? true: false)
    },
    prevSong: function(){
        if(!audio.loop){
            this.currentIndex == 0 ? this.currentIndex = 0 : this.currentIndex--
            playlist.querySelector('.song.active').classList.remove('active')
            playlist.querySelector(`div[index*="${this.currentIndex}"]`).classList.add('active')
        }
        this.loadCurrentSong()
    },
    nextSong: function(){
        if(!audio.loop){
            this.currentIndex == this.songs.length - 1 ? this.currentIndex = 0 : this.currentIndex++
            playlist.querySelector('.song.active').classList.remove('active')
            playlist.querySelector(`div[index*="${this.currentIndex}"]`).classList.add('active')
        }
        this.loadCurrentSong()
    },
    randomSong: function(){
        let randomIndex
        do{
            randomIndex = Math.floor(Math.random() * this.songs.length)
        }while (randomIndex == this.currentIndex) 
        this.currentIndex = randomIndex
        playlist.querySelector('.song.active').classList.remove('active')
        playlist.querySelector(`div[index*="${this.currentIndex}"]`).classList.add('active')
        this.loadCurrentSong()
    },
    start: function(){
        // Load ca??c settings
        this.loadConfig()
        // ??i??nh nghi??a ca??c thu????c ti??nh cho object
        this.definedProperties()
        // Load playList
        this.render();
        // l????ng nghe, x???? li?? ca??c s???? ki????n 
        this.handleEvents();
        // Load ba??i ha??t ??????u ti??n va??o UI
        this.loadCurrentSong()
    },
    seconds_to_mins: function(seconds){
        var minutes = Math.floor(seconds / (60));
        seconds -= minutes * (60);
        return minutes+":"+Math.floor(seconds);
    }
}

app.start()


