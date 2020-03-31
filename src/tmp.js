function Find(target, array)
{
    // write code here
    let m = array.length;
    if( m <= 0){
      return false;
    }
    let n = array[0].length;
    if(array[0][n - 1] === target){
      return true;
    } else if(array[0][n - 1] < target){
      let newarray = array.shift();
      return Find(target, newarray);
    } else {
      let newarray = array.map(function(item){
        return item.splice(item.length - 1, 1);
      });
      return Find(target, newarray);
    }
}

console.log(Find(7, [[1,2,3],[4,5,6],[7,8,9]]));