function prices(prices) {
    let sum = 0;
    if (prices.length <= 3 * 10 ** 4 && prices.length >= 1) {
        for (let i = 0; i < prices.length; i++) {
            for (let j = 0; j < prices.length; j++) {
                if (prices[i] < prices[j])
                    sum += prices[j] - prices[i];
                i = j;
                if(prices[i]>10**4 || prices[i]<0)
                    return 'incorrect value'
            }
        }
        return sum;
    }
    else return 'incorrect array'

}
console.log(prices([7,1,5,3,6,4]))
console.log(prices([1,2,3,4,5]))
console.log(prices([7,6,4,3,1]))
console.log(prices([7,600000,4,3,1]))
console.log(prices([]))
