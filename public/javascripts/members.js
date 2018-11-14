function deletemember(ind) {
    $.post(
        '/members/delete',
        {
            id: ind
        },
        (data, status) => {
            if (status === 'success') {
                document.documentElement.innerHTML = data;
            }
        }
    );
}

function addmember() {
    $.post(
        '/members/add',
        {
            name: $('#membername').val(),
            money: $('#membermoney').val()
        },
        (data, status) => {
            if (status === 'success') {
                document.documentElement.innerHTML = data;
            }
        }
    );
}

function changemoney() {
    $.post(
        '/members/changemoney',
        {
            id: $('#id').text(),
            money: $('#newmoney').val()
        },
        (data, status) => {
            if (status === 'success') {
                document.documentElement.innerHTML = data;
            }
        }
    );
}

function openmoneychanger(name, money, id) {
    // alert('name');
    global.rollbar.log(id);
    $('#id').text(id);
    $('#newmoney').val(money);
    $('#changemoney').css('display', 'block');
    $('#name').text(name);

}