const db = require('../dbConfig');
const Axios = require('axios');

module.exports = {
    getCoinById
}

function getCoinById(period, base, paired){
    Axios.get(`https://api.kucoin.com/api/v1/market/candles?type=${period}&symbol=${base}-${paired}&startAt=0&endAt=900000000000000000`)
    .then(result => {
        
        const getHeikinData = (arr) => {
            const newArr = []
            const arrR = arr.reverse();
            for(let i = 0; i < arrR.length; i++){
                if(i == 0){
                    const time = arrR[i][0]
                    const HA_open = (Number(arrR[i][1]) + Number(arrR[i][2])) / 2
                    const HA_close = (Number(arrR[i][1]) + Number(arrR[i][2]) + Number(arrR[i][3]) + Number(arrR[i][4])) / 4
                    const HA_high = Number(arrR[i][3])
                    const HA_low = Number(arrR[i][4])
                    const volume = arrR[i][5]
                    const turnover = arrR[i][6]
                    newArr.push([time.toString(), HA_open.toString(), HA_close.toString(), HA_high.toString(), HA_low.toString(), volume, turnover])
                }else{
                    const time = arrR[i][0]
                    const HA_open = (Number(newArr[newArr.length-1][1]) + Number(newArr[newArr.length-1][2])) /2
                    const HA_close = ((Number(arrR[i][1]) + Number(arrR[i][2]) + Number(arrR[i][3]) + Number(arrR[i][4]))) / 4
                    const HA_high = Math.max(Number(arrR[i][3]), HA_open, HA_close)
                    const HA_low = Math.min(Number(arrR[i][4]), HA_open, HA_close)
                    const volume = arrR[i][5]
                    const turnover = arrR[i][6]
                    newArr.push([time.toString(), HA_open.toString(), HA_close.toString(), HA_high.toString(), HA_low.toString(), volume, turnover.toString()]) 
                }
            }
            return newArr
        }
        
        const heikinData = getHeikinData(result.data.data);

        // console.log(heikinData)

        const lowArray = [];
        heikinData.map(lows => {
            lowArray.push(parseFloat(lows[4]))
        })

        const highArray = [];
        heikinData.map(highs => {
            highArray.push(parseFloat(highs[3]))
        })

        const low = Math.min(...lowArray).toFixed(8)
        const high = Math.max(...highArray).toFixed(8)
        const range = (high - low).toFixed(8)
        const step = (range / 100).toFixed(8)

        const stepArray = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
                
        // console.log(range, low, high, step)
        // console.log(highArray)
        // console.log(lowArray)

        const stepObjArray = stepArray(Number(low), Number(high), Number(step)).map(stepValue => {
            return ({step_value: Number(stepValue.toFixed(8)), volume: 0})
        })

        // console.log(stepObjArray)

        // const candle = result.data.data

        const loopOverArray = (stepObjArray, heikinData) => {
            const newArr = []
            for(let i = 0; i < stepObjArray.length; i++){
                // console.log(stepObjArray[i].step_value)
                let total = 0
                for(let j = 0; j < heikinData.length; j++){
                    if (Number(stepObjArray[i].step_value) >= Number(heikinData[j][4]) && Number(stepObjArray[i].step_value) <= Number(heikinData[j][3])){
                        // console.log(parseInt(heikinData[j][6]))
                        total += parseInt(heikinData[j][6])
                    }
                }
                newArr.push({ ...stepObjArray[i], volume: total })
            }
            return newArr
        }

        // console.log(loopOverArray(stepObjArray, heikinData))

        const stepsWithVol = loopOverArray(stepObjArray, heikinData)

        
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
        const va_price_high = findValueAreaHigh(stepsWithVol)
        const va_price_low = findValueAreaLow(stepsWithVol)

        console.log('-----------------------------------------------------------')
        console.log('Value Area Low Price: ','$', findValueAreaLow(stepsWithVol))  
        console.log('------------------------------------------------------------')      
        console.log('Value Area High Price: ','$',findValueAreaHigh(stepsWithVol))

        return db('base_coin')
            .insert({ name: base })
            .then(baseID => {
                return db('paired_coin')
                    .insert({ name: paired })
                    .then(pairedID => {
                        return db('paired_base')
                            .insert({ base_coin_id: baseID, paired_coin_id: pairedID, va_high: va_price_high, va_low: va_price_low })
                            .then(pb_id => {
                                return db('base_coin')
                                // .select('paired_base.id', 'base_coin.name as base_name', 'paired_coin.name as paired_name', 'paired_base.va_high', 'paired_base.va_low')
                                // .join('paired_base', 'base_coin.id', 'paired_base.base_coin_id')
                                // .join('paired_coin', 'paired_base.paired_coin_id', 'paired_coin.id')
                                // .where('base_name', '=', base)
                            })
                    })
            })

        // console.log(stepsWithVol)
        // console.log('Total Profile Volume: ', totalProfileVolume)
        // console.log('Value Area High Volume: ', valueAreaHigh)
        // console.log('Value Area Low Volume: ', valueAreaLow)

    })
    .catch(err => {
        console.log(err)
    })
}