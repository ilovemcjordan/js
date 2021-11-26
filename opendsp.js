var pageID = document.getElementById("id").value;
var jsonResultData = '';
var monthThisData = [];
var colorStyle = [];

//DashBoardの場合、APIをコールして、データを取得する。
if (pageID == "DashBoard") {
    var request = new XMLHttpRequest();
    request.open('GET', URL, true);
    request.responseType = "application/json",
        request.onload = function () {
            //DBからのデータを取得する
            var data = this.response;
            jsonResultData = JSON.parse(data);
            //当月のデータを取得
            for (var i = 0; i < jsonResultData.length; i++) {
                if (jsonResultData[i].createtime >= monthOneTime) {
                    monthThisData.push(jsonResultData[i]);
                }
            }

            //IDに従って データを並べ替える
            function GroupBy(array, fn) {
                //空対象を作成する
                const groups = {};
                //forEach利用して、データを読込する
                array.forEach(function (item) {
                    const group = JSON.stringify(fn(item));
                    //
                    groups[group] = groups[group] || [];
                    groups[group].push(item);
                });
                //
                return Object.keys(groups).map(function (group) {
                    return groups[group];
                });
            }

            //sort
            monthThisData.sort((a, b) => a.createtime.localeCompare(b.createtime));

            //パラメータ[id]を転送して、GroupBy方法をコールする。
            const results = GroupBy(monthThisData, function (item) {
                return [item.id];
            });

            //初めてデータを画面idで画面に表示する。
            var idName = [];
            const idNum = [];
            for (var i = 0; i < results.length; i++) {
                var data = results[i];
                idName[i] = data[0].id; //画面idのlistを取得する
                idNum[i] = results[i].length; //画面idの数量を取得する
                this.r = Math.floor(Math.random() * 255);
                this.g = Math.floor(Math.random() * 255);
                this.b = Math.floor(Math.random() * 255);
                colorStyle[i] = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',0.2)';
            };

            const labels = idName;
            const data1 = {
                labels: labels,
                datasets: [{
                    label: IDNAME,
                    data: idNum,
                    backgroundColor: colorStyle,
                    stack: 'combined',
                    type: 'bar'
                }]
            };

            const config = {
                type: 'line',
                data: data1,
                options: {
                    onClick: (c, i) => {
                        sessionStorage.setItem("idData", JSON.stringify(results[i[0].index]))
                        sessionStorage.setItem("Style", "id")
                        window.open('AccessDetail.html', 'newwindow', 'height=300,width=700,top=300,left=700,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no')
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: ''
                        }
                    },
                    scales: {
                        y: {
                            stacked: true
                        }
                    },
                },
            };

            //chart図を作成する
            var idChart = new Chart(
                document.getElementById('idChart'),
                config,
            );

            //レポジトリIDの種類を取得
            const monthThisDataS = GroupBy(monthThisData, function (item) {
                return [item.id];
            });

            var lastData = [];
            for (var i = 0; i < monthThisDataS.length; i++) {
                lastData[i] = monthThisDataS[i][0].id
            };

            var sortdata = [];
            var sortLength = [];
            var transforData = new Array();
            var J = 0;
            var M = 0;
            var SUM = 1;
            //第一件のデータを取得する
            sortdata[0] = monthThisData[0].createtime.substring(0, 10);
            //毎日の日期を取得する
            for (var i = 1; i < monthThisData.length; i++) {
                if (monthThisData[i].createtime.substring(0, 10) != monthThisData[i - 1].createtime.substring(0, 10)) {
                    sortLength[M] = SUM;
                    SUM = 0;
                    M = M + 1;
                    J = J + 1;
                    sortdata[J] = monthThisData[i].createtime.substring(0, 10);

                }
                SUM = SUM + 1
            }

            //毎日の訪問数量を取得する
            sortLength[M] = SUM;

            //初めてデータをuseridで画面に表示する。
            var ipName = [];
            const ipNum = [];
            var idNameMonth = [];
            var idx = 0;
            for (var i = 0; i < sortdata.length; i++) {

                ipName[i] = sortdata[i]; //時間を取得する
                // ipNum[i] = sortLength[i]; //当前の訪問数量を取得する
                transforData[i] = new Array()
                for (var j = 0; j < sortLength[i]; j++) {
                    transforData[i][j] = monthThisData[idx];
                    idx = idx + 1;
                }
            }

            //パラメータ[id]を転送して、GroupBy方法をコールする。
            var idxM = 0;
            var datasetMonth = [];
            var lastTrData = [];
            var accseeDate = [];
            for (var i = 0; i < lastData.length; i++) {
                ipNum[i] = new Array();
                accseeDate[i] = new Array();
                for (var j = 0; j < transforData.length; j++) {
                    idxM = 0;

                    for (var m = 0; m < transforData[j].length; m++) {
                        if (lastData[i] == transforData[j][m].id) {
                            lastTrData[idxM] = transforData[j][m]
                            idxM = idxM + 1
                        }
                    }
                    ipNum[i][j] = idxM

                    accseeDate[i][j] = lastTrData;
                    lastTrData = [];
                }
                datasetMonth[i] = {
                    label: lastData[i],
                    data: ipNum[i],
                    backgroundColor: colorStyle[i],
                }
            };

            const data_ip = {
                labels: ipName,
                datasets: datasetMonth
            };
            const config_ip = {
                type: 'bar',
                data: data_ip,
                options: {
                    onClick: (c, i) => {
                        sessionStorage.setItem("ipData", JSON.stringify(accseeDate[i[0].datasetIndex][i[0].index]))
                        sessionStorage.setItem("Style", "ip")
                        window.open('AccessDetail.html', 'newwindow', 'height=300,width=700,top=300,left=700,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no')

                    },
                    plugins: {
                        title: {
                            display: true,
                            text: IPNAME
                        },
                    },
                    responsive: true,
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true
                        }
                    }
                }
            };

            //chart図を作成する
            const ipChart = new Chart(
                document.getElementById('ipChart'),
                config_ip,
            );

        };

    request.send();
}

//AccessDetailの場合、画面listを作成する
if (pageID == "AccessDetail") {

    if (sessionStorage.getItem("Style") == "id") {
        var detailData = JSON.parse(sessionStorage.getItem("idData"));
        detailData.sort((a, b) => b.createtime.localeCompare(a.createtime)); //sort
    } else if (sessionStorage.getItem("Style") == "idIndex") {
        var detailData = JSON.parse(sessionStorage.getItem("indexData"));
        detailData.sort((a, b) => b.createtime.localeCompare(a.createtime)); //sort
    } else {
        var detailData = JSON.parse(sessionStorage.getItem("ipData"));
        detailData.sort((a, b) => b.createtime.localeCompare(a.createtime)); //sort
    }

    var thead = document.getElementById('thMain');
    var trow = getDataTHRow();
    thead.appendChild(trow);

    function getDataTHRow() {

        var row = document.createElement('tr'); //行を作成する

        var idCell = document.createElement('td'); //第一列のidを作成する
        idCell.innerHTML = '画面名'; //データを入れる
        row.appendChild(idCell); //行を追加

        var ipCell = document.createElement('td'); //第二列のアクセスIPを作成する
        ipCell.innerHTML = 'アクセスIP';
        row.appendChild(ipCell);

        var userCell = document.createElement('td'); //第三列のユーザエージェントを作成する
        userCell.innerHTML = 'ユーザエージェント';
        row.appendChild(userCell);

        var timeCell = document.createElement('td'); //第四列のアクセス時間を作成する
        timeCell.innerHTML = 'アクセス時間';
        row.appendChild(timeCell);

        return row; //trデータを戻る	 
    }


    var tbody = document.getElementById('tbMain');
    for (var i = 0; i < detailData.length; i++) { //データを繰り返し
        var trow = getDataRow(detailData[i]); //trデータを戻る
        tbody.appendChild(trow);
    }

    function getDataRow(data) {

        var row = document.createElement('tr'); //行を作成する

        var idCell = document.createElement('td'); //第一列のidを作成する
        idCell.innerHTML = data.id; //データを入れる
        row.appendChild(idCell); //行を追加

        var ipCell = document.createElement('td'); //第二列のアクセスIPを作成する
        ipCell.innerHTML = data.ipadress;
        row.appendChild(ipCell);

        var userCell = document.createElement('td'); //第三列のユーザエージェントを作成する
        userCell.innerHTML = data.useragent;
        row.appendChild(userCell);

        var timeCell = document.createElement('td'); //第四列のアクセス時間を作成する
        timeCell.innerHTML = data.createtime;
        row.appendChild(timeCell);

        return row; //trデータを戻る	 
    }

}