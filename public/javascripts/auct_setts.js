$("#timeout").change(function() {$("#timeout-output").text(this.value);});
$("#allTime").change(function() {$("#allTime-output").text(this.value);});
$("#researchPause").change(function() {$("#researchPause-output").text(this.value);});

function showAlert() {
    savechanges()

}

function savechanges() {
    $.post(
        '/settings',
        {
            DateTime: $("#DateTime").val(),
            timeout: $("#timeout").val(),
            allTime: $("#allTime").val(),
            researchPause: $("#researchPause").val()
        },
        (data, status) => {
            if (status === 'success') {
                document.getElementById('alert').style.display = 'block'
                setTimeout(function(){
                    document.getElementById('alert').style.display = 'none'
                }, 1337)
            }
        }
    );
}