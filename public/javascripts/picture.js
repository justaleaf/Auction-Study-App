function removeauct() {
    $.post(
        `/pictures/${$('#picid').text()}`,
        {
            inAuct: true
        },
        (data, status) => {
            if (status === 'success') {
                $(document).innerHTML = data;
                location.reload();
            }
        }
    );
}

function addauct() {
    $.post(
        `/pictures/${$('#picid').text()}`,
        {
            inAuct: false
        },
        (data, status) => {
            if (status === 'success') {
                $(document).innerHTML = data;
                location.reload();
            }
        }
    );
}

function changeinfo() {
    $('#inpform').css('display', 'none');
    $.post(
        `/pictures/${$('#picid').text()}`,
        {
            author: $('#newauth').val(),
            picName: $('#newname').val(),
            startPrice: $('#newprice').val(),
            description: $('#newdescr').val(),
            sMin: $('#newmins').val(),
            sMax: $('#newmaxs').val()
        },
        (data, status) => {
            if (status === 'success') {
                $(document).innerHTML = data;
                location.reload();
            }
        }
    );
}

