boardSelect = document.getElementById('manage-board');
companySelect = document.getElementById('manage-ticket_company');

document.getElementById('connectwisemanage_getDetailsButton').addEventListener('click',(e) => {
    const hasAppropriateKeyLength = (el) => el.value.length > 15; 
    console.log([document.getElementById('manage-private_key'),document.getElementById('manage-public_key')].every(hasAppropriateKeyLength));
    if ([document.getElementById('manage-private_key'),document.getElementById('manage-public_key')].every(hasAppropriateKeyLength)){
        console.log('hello');
        document.getElementById('connectwisemanage_loadingnotification').classList.toggle('hidden')
        let boardsRequest = new Request(`boards`);
        var integrationFormData = new FormData(document.getElementById('connectwisemanage-integration'));
        fetch(boardsRequest, {
            method: 'POST',
            headers: {
            },
            body: integrationFormData,
        }).then(r => r.json())
        .then(data => {
            if(boardSelect.disabled){
                for (b in data.boards){
                    var opt = document.createElement("option");
                    opt.value = b;
                    opt.text = data.boards[b]
                    boardSelect.add(opt,null)
                }
                boardSelect.disabled = false;
                companiesArray = Object.keys(data.companies).map(key => [key,data.companies[key]]).sort((x,y) => y[1] - x[1]);
                for (x in companiesArray){
                    var opt = document.createElement("option");
                    opt.value = companiesArray[x][0];
                    opt.text = companiesArray[x][1];
                    companySelect.add(opt,null)
                }
                companySelect.disabled = false;
            }
        }).catch(e => {
            console.log(e);
        }).finally(e => {
            document.getElementById('connectwisemanage_loadingnotification').classList.toggle('hidden');
        });
    } else {

    }
});

boardSelect.addEventListener('input', ev => {
    let statusesRequest = new Request(`boardsstatus`);
    var integrationFormData = new FormData(document.getElementById('connectwisemanage-integration'));
    fetch(statusesRequest, {
        method: 'POST',
        headers: {
        },
        body: integrationFormData,
    }).then(r => r.json())
    .then(data => {
        var status_fields = [document.getElementById('manage-status_up'),document.getElementById('manage-status_down')];
        status_fields.forEach(el => {
            var length = el.options.length;
            for (i=length-1;i >= 1; i--){
                el.remove(i);
            }
            console.log(Object.keys(data).length);
            if (Object.keys(data).length > 0) {
                for (b in data) {
                    var opt = document.createElement("option");
                    opt.value = b;
                    opt.text = data[b]
                    el.add(opt,null)
                }
                el.disabled = false;
            } else {
                el.disabled = true;
            }
        });
    })
    .catch(e => {
        console.log(e);
    });
})