let IdLogger = 0;

class Logger {

    static allMessages = [];

    constructor(action, executionTime) {
        this.id = IdLogger++;
        this.action = action;
        this.executionTime = executionTime;

        //keep the track of all the logs
        Logger.allMessages.push(this.getMessageDetail);
    }

    get getMessageDetail() {
        return {
            id: this.id,
            action: this.action,
            executionTime: this.executionTime
        }
    }

    //return the real time and date
    dateTime() {
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return date + ' - ' + time;
    }

    //add the message to the logger (UI)
    dispatchMessage() {
        let logTime = "<div class='logTime'><p>" + this.dateTime() + "</p><p>Execution Time : "
                      + this.executionTime.toFixed(2) + "s</p></div>";

        let msg = " <div class='logDetail'><h3>" + this.action + "</h3>" + logTime + "</div>";
        $(".logMsg").append(msg);

        $(".logMsg").animate({ scrollTop: $('.logMsg').prop("scrollHeight") }, 250);
    }
}

export default Logger;