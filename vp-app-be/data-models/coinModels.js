const db = require('../dbConfig');
const Axios = require('axios');

module.exports = {
    getCoinById
}

function getCoinById(period, base, paired){
    Axios.get(`https://api.kucoin.com/api/v1/market/candles?type=${period}&symbol=${base}-${paired}&startAt=0&endAt=900000000000000000`)
    .then(result => {
        db('base_coin')
            .insert({ name: base });
        db('paired_coin')
            .insert({ name: paired })
        const highArray = [];
        result.data.data.map(highs => {
            highArray.push(parseFloat(highs[3]))
        })
        const lowArray = [];
        result.data.data.map(lows => {
            lowArray.push(parseFloat(lows[4]))
        })
        const low = Math.min(...lowArray).toFixed(8)
        const high = Math.max(...highArray).toFixed(8)
        const range = (high - low).toFixed(8)
        const step = (range / 100).toFixed(8)
        console.log(range, low, high, step)
        const stepArray = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
        

        const stepObjArray = stepArray(Number(low), Number(high), Number(step)).map(stepValue => {
            return ({step_value: Number(stepValue.toFixed(8)), volume: 0})
        })

        // console.log(stepObjArray)

        const candle = result.data.data

        const loopOverArray = (stepObjArray, candle) => {
            const newArr = []
            for(let i = 0; i < stepObjArray.length; i++){
                // console.log(stepObjArray[i].step_value)
                let total = 0
                for(let j = 0; j < candle.length; j++){
                    if (Number(stepObjArray[i].step_value) >= Number(candle[j][4]) && Number(stepObjArray[i].step_value) <= Number(candle[j][3])){
                        // console.log(parseInt(candle[j][6]))
                        total += parseInt(candle[j][6])
                    }
                }
                newArr.push({ ...stepObjArray[i], volume: total })
            }
            return newArr
        }

        // console.log(loopOverArray(stepObjArray, candle))

        const stepsWithVol = loopOverArray(stepObjArray, candle)

        
        const totalProfileVolume = stepsWithVol.reduce((total, current) => {
            return total += current.volume;
        }, 0)

        const valueAreaHigh = parseInt(Number(totalProfileVolume) * .7)

        const valueAreaLow = parseInt(Number(totalProfileVolume) * .3)

        const findValueAreaLow = (arr) => {
            let volumeTotal = 0
            for(let i = 0; i < arr.length; i++){
                if(volumeTotal > valueAreaLow){
                    return arr[i-1].step_value
                }else{
                    volumeTotal += arr[i].volume
                }
            }
        } 

        const findValueAreaHigh = (arr) => {
            let volumeTotal = 0
            for(let i = 0; i < arr.length; i++){
                if(volumeTotal > valueAreaHigh){
                    return arr[i-1].step_value
                }else{
                    volumeTotal += arr[i].volume
                }
            }
        } 

        console.log(stepsWithVol)
        console.log(totalProfileVolume)
        console.log(valueAreaHigh)
        console.log(valueAreaLow)
        console.log(findValueAreaLow(stepsWithVol))        
        console.log(findValueAreaHigh(stepsWithVol))
    })
    .catch(err => {
        console.log(err)
    })
    return db('base_coin')
        .select('paired_base.id', 'base_coin.name as base_name', 'paired_coin.name as paired_name', 'paired_base.range', 'paired_base.step', 'paired_base.va_high', 'paired_base.va_low', 'paired_base.current_price')
        .join('paired_base', 'base_coin.id', 'paired_base.base_coin_id')
        .join('paired_coin', 'paired_base.paired_coin_id', 'paired_coin.id');
}

// function findAllUsers(){
//     return db('users');
// }

// function findByUsername(username){
//     return db('users')
//         .where(username);
// }