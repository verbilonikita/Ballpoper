import './css/main.sass'

document.addEventListener("DOMContentLoaded", ready); 

function ready(){
    let tId, wId
    const   areaBall = document.getElementById('areaBall'),
            bee = document.getElementById('bee'),
            button = document.getElementById('button'),
            butOneM = document.getElementById('buttonOneMore'),
            divC = document.getElementById('count'),
            los = document.getElementById('loser'),
            win = document.getElementById('win'),
            cloud = document.getElementById('background-wrap')

    const c = areaBall.getBoundingClientRect()

    let elDom = [],
        cPass = 0,
        cBlown = 0

    const colorArr = ['255, 0, 255', '128, 0, 128', '255, 255, 0', '0, 255, 0', 
                        '0, 255, 255', '0, 0, 255', '255, 0, 0' ]

    const timeLn = s => Math.log(s*40)*(1000/17)

    let allowCB  =  {
                        l: 0, 
                        t: 0,
                        b: c.bottom - coordsBee().cbe.height - 5,
                        r: c.width - coordsBee().cbe.width
                    }

    let pcBee = { x: null, y: null }

    pcBee = new Proxy(pcBee, {
        set(target, prop, value){
            if(prop === 'x' && into( allowCB.l, allowCB.r, value, value) ) {
                target[prop] = value
            }
            if(prop === 'y' && into( allowCB.t, allowCB.b, value, value) ) {
                target[prop] = value
            }
            return target
        }
    })

    function into(ot1, of1, ot2, of2){
        let flag = false
        for(let i = ot1 ; i <= of1; i++){
            for (let k = ot2 ; k <= of2; k++) {
                Math.trunc(i) === Math.trunc(k) && (flag = true)
            }
        }
        return flag
    }
    
    const randInt = (max, min) => Math.floor(Math.random() * (max-min)) + min + 1

    class Ball{
        constructor(options){
            const {color, width, left} = options
            this.color = color
            this.width = width 
            this.left = left - width
        }
        render(){
            const   div = document.createElement('div'),
                    s = div.style,
                    { width, color, left, top } = this

            s.height = width + 'px'
            s.width = width * .7 + 'px'
            s.background = `rgba(${color}, 0.88)`
            s.color = `rgba(${color}, 0.8)`
            s.boxShadow =   `rgb(0 0 0 / 17%) 17px 7px 10px inset, 
                                    inset 17px 7px 10px rgba(${color}, 1), 
                                    rgb(0 0 0 / 27%) 0px -3px 5px inset`
            s.left = left + 'px'
            s.top = top + 'px'

            elDom.push(div)
        }
    }

    const rBall = opt => new Ball({ ...opt }).render()

    function coordsBee(){
        const   cbe = bee.getBoundingClientRect(),
                y = cbe.y + cbe.height,
                x = cbe.x + cbe.width/2 - 1,
                xx = x + 2,
                yy = y + 2
        return { cbe, x, y, xx, yy }
    }

    const rNewBall = ( io , i , fn ) => {
        io > 0 ? setTimeout(()=> {
                            const   color = colorArr[randInt(colorArr.length-1, 0)],
                                    width = randInt(90,40),
                                    left = randInt( c.width , width)
                            rBall({ color , width, left }) 
                            areaBall.append(elDom[elDom.length - 1])
                            setTimeout(() => fn() , i)
                        }, i ) : undefined
    }

    button.addEventListener('click', startGame )
    butOneM.addEventListener('click', startGame )

    function startGame (){
        button.style.display = 'none'
        divC.classList.remove('animationZoom')

        let X, Y, ofsLeft, ofsTop
        const tD = document.getElementById('timer')

        let flPress = false,
            startDate = new Date()
        
        const inDrag = (cur) => {
            flPress = true
            ofsLeft = bee.offsetLeft
            ofsTop = bee.offsetTop
            X = cur.clientX
            Y = cur.clientY
        }

        const mDrag = cur => {
            bee.style.left = `${pcBee.x}px`
            bee.style.top = `${pcBee.y}px`
            const   cX = cur.clientX - X,
                    cY = cur.clientY - Y
            pcBee.x = ofsLeft + cX
            pcBee.y = ofsTop + cY
        }

        const dragStart = e => e.type === "touchstart" ? inDrag(e.touches[0]) : inDrag(e)
        const dragEnd = () => flPress = false 
        const drag = e => flPress && (e.type === 'touchmove' ? mDrag(e.touches[0]) : mDrag(e) )

        bee.onmousedown = dragStart
        document.onmouseup = dragEnd
        document.onmousemove = drag
        bee.addEventListener('touchstart', dragStart, false)
        document.addEventListener('touchend', dragEnd, false)
        document.addEventListener('touchmove', drag, false)

        for (const el of cloud.children) el.classList.add('cl')
        
        const   passEl = el => { el.remove(); cPass++ ; return true },
                blownEl = el => { el.remove(); cBlown++ ; return true }

        const clock = cSec => {
            let ti = new Date(cSec) 
            const   iDate = new Date().getTime() - startDate.getTime()
                    ti -= iDate
            let ms = Math.floor( ti % 1000 / 10 ),
                s = Math.floor( ti / 1000 % 60 )
            return { s, ms, ti }
        }
        
        const rePosR = el => {
            let l = el.offsetLeft / 150
            el.offsetLeft > 0 ? el.style.left = el.offsetLeft - l  + 'px' : el
        }

        const rePosL = el => {
            let l = (c.width - el.offsetLeft) / 150
            el.offsetLeft < c.width - el.offsetWidth ? el.style.left = el.offsetLeft + l + 'px' : el
        }

        const wthW = (t, fn) => {
            return setTimeout(()=> {
                            let sms = clock(60000)
                            const bolSide = Boolean(Math.floor(Math.random() * (2-0)) + 0)
                            const reW = () => {
                                let ss = clock(60000)
                                if(ss.s > sms.s-t/2000){
                                    elDom.forEach( el => bolSide ? rePosR(el) : rePosL(el) )
                                    setTimeout(reW, 20)
                                }
                            }
                            reW()
                            setTimeout(() => fn() , t)
                }, t)
        } 


        const redraw = () => {
            const   sms = clock(60000),
                    spB  = 6 - sms.s * .1 + 1

            sms.s < 10 && ( sms.s = `0${sms.s}` )
            sms.ms < 10 && ( sms.ms = `0${sms.ms}` )

            elDom.forEach( el => {
                const   ball = el.getBoundingClientRect(),
                        bee = coordsBee()
                el.style.top = el.offsetTop - spB + 'px' 
                el.offsetTop + el.clientHeight < 0 && passEl(el)
                into( ball.x, ball.right, bee.x, bee.xx ) && into( ball.y, ball.bottom, bee.y, bee.yy ) && blownEl(el)  
            })

            sms.ti > 0 && setTimeout(redraw, 20)

            if(sms.ti <= 0){
                sms.s = '00'
                sms.ms = '00'
                flPress = false
                los.innerText = `${cPass}`
                win.innerText = `${cBlown}`
                divC.classList.add('animationZoom')
                for (const el of areaBall.children) el.classList.add('animationiHide')
                clearTimeout(tId)
                clearTimeout(wId)
                tD.innerText = `${sms.s}:${sms.ms}`
            }

            tD.innerText = `${sms.s}:${sms.ms}`
        }
        redraw()
        
        const cIntervar = () => {
            const   io = clock(60000),
                    i = randInt(timeLn(io.s), 0)
            tId = rNewBall( io.s, i, cIntervar )
        }
        cIntervar()


        const wI = () => {
            const   t = randInt(6000, 4000)
            wId = wthW( t, wI )
        }
        wI()
    }
}

