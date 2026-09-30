function findBalancedNumber(nums) {
    let left =[]
    let right =[]

    let pivot ;
    let mid = Math.floor(nums.length / 2);
    for (let i = 0; i < mid; i++) {
        left.push(nums[i]);
    }
    for (let i = mid + 1; i < nums.length; i++) {
        right.push(nums[i]);
    }
   
    let n1 = left.length
    let n2 = right.length
    let i = 0
    let j = 0
  let index = 0
    while(i<n1 && j<n2) {
        if (nums[index] > left[i] && nums[index] < right[j]) {
                        pivot = nums[index]
        }
        if (j < n2) {
            j++
        }
        if (i < n1) {
            i++
        }
        index++
    }
    return pivot
}

console.log(findBalancedNumber([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))