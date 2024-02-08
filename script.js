let a = '';
let b = '';
let znak = '';
let finish = false;

const numbers = ['0','1','2','3','4','5','6','7','8','9','.'];
const action = ['-','+','x','/','%'];
const resultCalc = document.querySelector('.result-calc p');
const ac = document.querySelector('.ac');
const buttons = document.querySelector('.buttons');

function calcClear(){
    a = '';
    b = '';
    znak = '';
    finish = false;
    resultCalc.textContent = 0;
}
ac.addEventListener('click', calcClear);
buttons.addEventListener('click', function(e){
    if(!e.target.classList.contains('btn')) return;
    if(e.target.classList.contains('ac')) return;
    resultCalc.textContent = '';
    const key = e.target.textContent;
    // console.log(key)
    if(numbers.includes(key)){
        if(b == '' && znak == ''){
        a += key;
        resultCalc.textContent = a;
        }else if (a!='' && b!=''&& finish){
            b = key;
            finish = false;
            resultCalc.textContent = b;
        }
        else{
            b += key;
            resultCalc.textContent = b;
        }
        console.log(a,b,znak);
        return
    }
    if(action.includes(key)){
        znak = key;
        resultCalc.textContent = znak;
        console.log(a,b,znak);
        return
    }
    
    if(key == '='){
        if(b=='')b=a;
        switch (znak){
            case '+':
                a = (+a) + (+b);
                break;
            case '-':
                a = a - b;
                break;
            case 'x':
                a = a * b;
                break;
            case '/':
                if(b==0){
                    resultCalc.textContent = 'Помилка!';
                    a='';
                    b='';
                    znak=''
                    return
                }
                a = a / b;
                break;
        }
        finish = true;
        resultCalc.textContent = a;
        console.log(a, b, znak)
    }
})
