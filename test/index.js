

// async function sleep (second) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve()
//     }, second * 1000);
//   })
// }

// async function begin () {

//   const arr = Array.apply(null, { length: 3 }).map((item, idx) => idx)
//   for (i of arr) {
    
//     await sleep(2)
//     console.log('------')
//   }

// }

// begin()

const obj = [
  { a: 1, b: 2 },
  { c: 3, d: 4 }
]

for (let key of obj) {
  console.log(key)
}