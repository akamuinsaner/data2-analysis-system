$(function() {
    var season = '第一赛季';
    var total = 0;
    var seasons = [];
    var seasonData = [];
    function getDataBySeason(season) {
        $.ajax({
            method: 'GET',
            url: '/api/dataBySeason?season=' + season,
            success: function(data) {
                seasonData = data;
                $('#season-data').empty();
                $('#season-data').html(seasonData.map((item, index) => {
                    return `<tr>
                        <td>${index + 1}</td>
                        <td class="name">${item.name}</td>
                        <td class="win">${item.win}</td>
                        <td class="lose">${item.lose}</td>
                        <td class="absence">${item.absence}</td>
                        <td>${(item.winRate * 100).toFixed(2) + '%'}</td>
                        <td class="kill">${item.kill}</td>
                        <td class="death">${item.death}</td>
                        <td class="assist">${item.assist}</td>
                        <td>${item.kda}</td>
                        <td><button type="button" class="btn btn-primary btn-sm btn-edit">编辑</button></td>
                    </tr>`
                }).join(''));
                $('.btn-edit').on('click', function() {
                    const parent = $(this).parent().parent();
                    $('#editUserModal .name').val(parent.find('.name').html());
                    $('#editUserModal .win').val(parent.find('.win').html());
                    $('#editUserModal .lose').val(parent.find('.lose').html());
                    $('#editUserModal .absence').val(parent.find('.absence').html());
                    $('#editUserModal .kill').val(parent.find('.kill').html());
                    $('#editUserModal .death').val(parent.find('.death').html());
                    $('#editUserModal .assist').val(parent.find('.assist').html());
                    $('#editUserModal').addClass('show').show();
                })
            }
        })
    }
    function getSeasonTotal(season) {
        $.ajax({
            method: 'GET',
            url: '/api/seasonTotal?season=' + season,
            success: function(data) {
                total = data;
                $('#total').html(total);
            }
        })
    }
    function getSeasons() {
        $.ajax({
            method: 'GET',
            url: '/api/seasons',
            success: function(data) {
                seasons = data;
                if (seasons[0]) {
                    season = seasons[0];
                    getDataBySeason(season);
                    getSeasonTotal(season);
                }
                $('#seasons').html(seasons.map(s => `<option value=${s}>${s}</option>`).join(''));
                $('#seasons').val(season);
            }
        })
    }
    function createUser() {
        $.ajax({
            method: 'POST',
            url: '/api/createUser',
            data: {
                season,
                total,
                name: $('#createUserModal .name').val()
            },
            success: function() {
                $('#createUserModal').removeClass('show').hide();
                getDataBySeason(season);
            }
        })
    }
    function editUser() {
        $.ajax({
            method: 'POST',
            url: '/api/editUser',
            data: {
                season,
                name: $('#editUserModal .name').val(),
                win: $('#editUserModal .win').val(),
                lose: $('#editUserModal .lose').val(),
                absence: $('#editUserModal .absence').val(),
                kill: $('#editUserModal .kill').val(),
                death: $('#editUserModal .death').val(),
                assist: $('#editUserModal .assist').val()
            },
            success: function() {
                $('#editUserModal').removeClass('show').hide();
                getDataBySeason(season);
            }
        })
    }
    function createSeason() {
        $.ajax({
            method: 'POST',
            url: '/api/createSeason',
            data: {
                name: $('#seasonModal .name').val()
            },
            success: function() {
                $('#seasonModal').removeClass('show').hide();
                getSeasons();
            }
        })
    }
    $('#seasons').change(function() {
        getDataBySeason($(this).val())
    })
    $('#createUserModalBtn').on('click', function() {
        $('#createUserModal').addClass('show').show();
    })
    $('.btn-close').on('click', function() {
        $($(this).attr('data-bs-modal')).removeClass('show').hide();
    })
    $('#createUser').on('click', createUser);
    $('#editUser').on('click', editUser);
    $('#seasonModalBtn').on('click', function() {
        $('#seasonModal').addClass('show').show();
    })
    $('#createSeason').on('click', createSeason);
    getSeasons();
})