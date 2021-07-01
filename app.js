const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const player = $('.player')
const dashboard = $('.dashboard')
const heading = $('header h2')
const cd = $('.cd')
const cdWidth = cd.offsetWidth
const cdThumb = $('.cd-thumb')
const control = $('.control')
const btnRepeat = $('.btn-repeat')
const btnPrev = $('.btn-prev')
const btnPlay = $('.btn-play')
const btnNext = $('.btn-next')
const btnRandom = $('.btn-random')
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
    render: function(){
        htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
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
        // phóng to thu nhỏ CD
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
        // mặc đinh k quay CD
        cdThumbAnimation.pause()
        // khi click btn Play
        btnPlay.onclick = function(){
            // Nếu đang chạy => dừng
            if(_this.isPlaying){
                cdThumbAnimation.pause()
                audio.pause()
            }else{
                cdThumbAnimation.play()
                audio.play()
            }
        }
        // khi song chạy
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
        }
        // khi song dừng
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
        }
        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            currentTime = _this.seconds_to_mins(audio.currentTime)
            duration = _this.seconds_to_mins(audio.duration)
            timeCurrent.innerText = `${currentTime}`
            timeDuration.innerText = `${duration}`
            progress.max = audio.duration
            progress.value = audio.currentTime
        }
        // khi clink progress, chuyển đến đoạn click
        progress.onchange = function(){
            audio.currentTime = progress.value
        }
        // khi clink btn Repeat
        btnRepeat.onclick = function(){
            _this.isRandom = false
            btnRandom.classList.toggle('active', _this.isRandom)
            audio.loop = !audio.loop
            btnRepeat.classList.toggle('active', audio.loop)
        }
        // khi click btn Prev
        btnPrev.onclick = function(){
            if(_this.isRandom){
                _this.randomSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            cdThumbAnimation.play()
            _this.render()
        }
        // khi click btn Next
        btnNext.onclick = function(){
            if(_this.isRandom){
                _this.randomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            cdThumbAnimation.play()
            _this.render()
        }
        // khi click btn random => xử lý bật tắt random mode
        btnRandom.onclick = function(){
            if(_this.isRandom){
                _this.isRandom = false
            }else{
                _this.isRandom = true
                audio.loop = false
                btnRepeat.classList.toggle('active', audio.loop)
            }
            btnRandom.classList.toggle('active', _this.isRandom)
        }
        // xử lý khi audio ended
        audio.onended = function(){
            if(_this.isRandom){
                _this.randomSong()
            }else{
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
                    _this.currentIndex = song.dataset.index
                    _this.loadCurrentSong()
                    audio.play()
                }
            }
        }
    },
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.img})`
        audio.src = this.currentSong.audio

    },
    prevSong: function(){
        this.currentIndex == 0 ? this.currentIndex = 0 : this.currentIndex--
        this.loadCurrentSong()

    },
    nextSong: function(){
        this.currentIndex == this.songs.length - 1 ? this.currentIndex = 0 : this.currentIndex++
        // document.querySelector('.song.active').classList.remove('.active')
        this.loadCurrentSong()
    },
    randomSong: function(){
        let randomIndex
        do{
            randomIndex = Math.floor(Math.random() * this.songs.length)
        }while (randomIndex == this.currentIndex) 
        this.currentIndex = randomIndex
        this.loadCurrentSong()
    },
    start: function(){
        // Định nghĩa các thuộc tính cho object
        this.definedProperties()
        // lắng nghe, xử lí các sự kiện 
        this.handleEvents();
        // Load playList
        this.render();
        // Load bài hát đầu tiên vào UI
        this.loadCurrentSong()
    },
    seconds_to_mins: function(seconds){
        var minutes = Math.floor(seconds / (60));
        seconds -= minutes * (60);
        return minutes+":"+Math.floor(seconds);
    }
}

app.start()


