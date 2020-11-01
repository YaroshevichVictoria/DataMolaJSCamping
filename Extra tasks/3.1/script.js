function maxSumArr(arr) {
    let sum=0;
    let maxSum=arr[0];
    for (let el of arr) {
        sum += el;
        if (sum < el) {
            sum = el;
        }
        if (maxSum < sum) {
            maxSum= sum;
        }
    }
    return maxSum;
}

console.log(maxSumArr([-10,-7,-5,-15]))
console.log(maxSumArr([1,-3,5,1]))
console.log(maxSumArr([-10,-7,0,-15]))
console.log(maxSumArr([0,7,5,-15]))