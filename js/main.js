//resgistrando a service worker
if('serviceWorker' in navigator){
    window.addEventListener('load', async  ()=>{
        try{
            let reg;
            reg= await navigator.serviceWorker.register('/sw.js', {type:"module"});

            console.log('Service worker resgistrada! 😎', reg);
        }catch(err){
            console.log('😣 Service worker registro falhou:', err);
        }
    });
}

let posicaoInicial;//variavel para capturar a posicao
const capturarLocalizacao = document.getElementById('localizacao');
const irparaLocal = document.getElementById('local');
const latitude = document.getElementById('latitude');
const longitude = document.getElementById('longitude');
const mapa = document.getElementById('gmap_canvas');

const sucesso = (posicao) => { //callback de sucesso para captura da posicao
    posicaoInicial = posicao;
    latitude.innerHTML = posicaoInicial.coords.latitude;
    longitude.innerHTML = posicaoInicial.coords.longitude;
    mapa.src ="https://maps.google.com/maps?q="+posicaoInicial.coords.latitude+","+posicaoInicial.coords.longitude+"&t=&z=17&ie=UTF8&iwloc=&output=embed"
}

const erro = (error) => {//callback de error (falha para captura de localizacao)
   let errorMessage;
   switch(error.code){
    case 0:
            errorMessage = "Erro desconhecido"
        break;
        case 1:
            errorMessage = "Permissão negada!"
        break;
        case 2:
            errorMessage = "Cpatura de posição indisponível!"
        break;
        case 3:
            errorMessage = "Tempo de solicitação execido!"
        break;
   }
   console.log('Ocorreu um erro:' + errorMessage);
};

capturarLocalizacao.addEventListener('click', () =>{
    navigator.geolocation.getCurrentPosition(sucesso, erro);
});

irparaLocal.addEventListener("click", () =>{
    const lat = document.getElementById ("lat").value;
    const long = document.getElementById ("long").value;
    mapa.src ="https://maps.google.com/maps?q="+lat+","+long+"&t=&z=17&ie=UTF8&iwloc=&output=embed"

});