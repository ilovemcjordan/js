var pageID = document.getElementById("id").value;
var jsonData = '';
var thisMonthData = [];
var colorIndexStyle = [];
var monthFromTime = ''

//日期を取得する
var nowdate = new Date();
var nowYear = nowdate.getFullYear();
var nowMonth = nowdate.getMonth() + 1;
nowMonth = nowMonth < 10 ? ('0' + nowMonth) : nowMonth
var nowDay = nowdate.getDate();
nowDay = nowDay < 10 ? ('0' + nowDay) : nowDay

//当月の第一日時間を取得する
monthFromTime = nowYear + '-' + nowMonth + '-' + '01' + ' ' + '00' + ':' + '00' + ':' + '00';

//ブラウザの種類を取得する
var parser = new UAParser();
var result = parser.getResult();

//UUIDを取得する
var UUID = '';
if (localStorage.getItem("UUID") == null) {
    UUID = getUUID();
    localStorage.setItem("UUID", UUID)
} else {
    UUID = localStorage.getItem("UUID")
}

function getUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

//挿入の項目を設定する
var params = {
    id: pageID,
    ipAdress: UUID,
    userAgent: result.browser.name
};

//requestdataを設定する
var requestPost = new XMLHttpRequest();
requestPost.open('POST', URL, true);
requestPost.setRequestHeader("Content-type", "application/json");
requestPost.onload = function () {};
requestPost.send(JSON.stringify(params))

//DashBoardの場合、APIをコールして、データを取得する。

var request = new XMLHttpRequest();
request.open('GET', URL, true);
request.responseType = "application/json",
    request.onload = function () {
        //DBからのデータを取得する
        var data = this.response;
        jsonData = JSON.parse(data);
        //当月のデータを取得
        for (var i = 0; i < jsonData.length; i++) {
            if (jsonData[i].createtime >= monthFromTime) {
                thisMonthData.push(jsonData[i]);
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
        thisMonthData.sort((a, b) => a.createtime.localeCompare(b.createtime));
        //パラメータ[id]を転送して、GroupBy方法をコールする。
        const results = GroupBy(thisMonthData, function (item) {
            return [item.id];
        });

        var dateData = [];
        var dateDataLG = [];
        var indexDetailData = [];
        var M = 0;
        var SUM = 0;
        for (var i = 0; i < results.length; i++) {
            var pageData = results[i];
            if (pageID == pageData[0].id) {
                //第一件のデータを取得する

                //毎日の日期を取得する
                for (var n = 0; n < pageData.length; n++) {

                    if (n == 0) {
                        dateData[0] = pageData[0].createtime.substring(0, 10);
                        indexDetailData[0] = new Array();
                        indexDetailData[0][0] = pageData[0]
                        SUM = SUM + 1
                    } else {
                        if (pageData[n].createtime.substring(0, 10) != pageData[n - 1].createtime.substring(0, 10)) {
                            dateDataLG[M] = SUM;
                            SUM = 0;
                            M = M + 1;
                            indexDetailData[M] = new Array();
                            indexDetailData[M][SUM] = pageData[n]
                            SUM = SUM + 1;
                            dateData[M] = pageData[n].createtime.substring(0, 10);
                        } else {
                            indexDetailData[M][SUM] = pageData[n];
                            SUM = SUM + 1;
                        }
                    }
                }
                //毎日の訪問数量を取得する
                dateDataLG[M] = SUM;
            }
        }

        for (var i = 0; i < dateData.length; i++) {
            this.r = Math.floor(Math.random() * 255);
            this.g = Math.floor(Math.random() * 255);
            this.b = Math.floor(Math.random() * 255);
            colorIndexStyle[i] = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',0.2)';
        }

        const dataIndex = {
            labels: dateData,
            datasets: [{
                label: IPNAME,
                data: dateDataLG,
                backgroundColor: colorIndexStyle,
                stack: 'combined',
                type: 'bar'
            }]
        };
        const configIndex = {
            type: 'line',
            data: dataIndex,
            options: {
                onClick: (c, i) => {
                    sessionStorage.setItem("indexData", JSON.stringify(indexDetailData[i[0].index]))
                    sessionStorage.setItem("Style", "idIndex")
                    window.open('githubpages/AccessDetail.html', 'newwindow', 'height=300,width=700,top=300,left=700,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no')
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
        var rptChart = new Chart(
            document.getElementById('rptChart'),
            configIndex,
        );
    };
request.send();