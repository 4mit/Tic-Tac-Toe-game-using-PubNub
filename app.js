var app = angular.module('app',['ngStorage']);
//app.filter('someFilter',function(){
//
//});

app.controller('ctrl',['$scope','$localStorage','$window',function($scope,$localStorage,$window){
    $scope.promptUer = false;
    $scope.user = {};
    $scope.matrix = [
        ["-","-","-"],
        ["-","-","-"],
        ["-","-","-"]
    ];
    
    pubnub = new PubNub({
        publishKey : 'demo',
        subscribeKey : 'demo'
    });
    function createPubNubNSubscribe(scope,localStorage){ 
        pubnub.subscribe({
            channels: ['hello_world'] 
        });
        pubnub.addListener({
            status: function(statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    startTransmitting(scope,localStorage);
                }
            },
            message: function(msg) {
                console.log(msg.message);
                if(msg.user){
                    updateandCheckIfWins(scope,localStorage,msg);  
                }
                if(msg.publisher){
                    updateandCheckIfWins(scope,localStorage,msg);
                }
            },
            presence: function(presenceEvent) {
                // handle presence
            }
        });
    }
    function updateandCheckIfWins(scope,localStorage,msg){
        if(msg.message.scopeMatrix)
            scope.matrix = msg.message.scopeMatrix;
        else
            scope.matrix = msg.message.user.matrix;
        $scope.$apply();
        
        validate($scope,msg);
        console.log(scope);
        console.log($scope);
    }

    function validate(scope,msg){
        var tickSign = msg.message.boxValue;
        var i = msg.message.boxIdentity[0];
        var j = msg.message.boxIdentity[1];
        
        if(i && j){
            if(scope.matrix[i][j]!='-' && i==1 && j==1){
                if((scope.matrix[0][1] == tickSign && scope.matrix[2][1] ==tickSign ) || (scope.matrix[0][1] ==tickSign  && scope.matrix[2][1] ==tickSign)){
                    window.alert("you won");
                    }
                }

                else if(scope.matrix[0][0] !='-' && i==0 && j==0){
                    if((scope.matrix[0][1] == tickSign && scope.matrix[0][2] == tickSign) || (scope.matrix[1][0] == tickSign && scope.matrix[2][0] == tickSign) || (scope.matrix[1][1] == tickSign && scope.matrix[2][2] == tickSign)){
                        window.alert("you won");
                    }
                }
                else if(scope.matrix[0][1]!='-' && i==0 && j==1){
                    if((scope.matrix[0][0] == tickSign && scope.matrix[0][2] == tickSign) || (scope.matrix[1][1] == tickSign && scope.matrix[2][1] == tickSign)){
                        window.alert("you won");
                    }
                }

                else if(scope.matrix[0][2] !='-' && i==0 && j==2){
                    if((scope.matrix[0][0]== tickSign && scope.matrix[0][1]== tickSign) || (scope.matrix[1][2]== tickSign && scope.matrix[2][2]== tickSign)){
                        window.alert("you won");
                    }

                }else if(scope.matrix[1][0]!='-' && 1==0 && j==0){
                    if((scope.matrix[0][0]== tickSign && scope.matrix[2][0] == tickSign) || (scope.matrix[1][1]== tickSign && scope.matrix[1][2]== tickSign)){
                        window.alert("you won");
                    }
                }else if(scope.matrix[1][2]!='-' && i==1 && j==2){
                    if((scope.matrix[0][2]== tickSign && scope.matrix[2][2]== tickSign) || (scope.matrix[1][0]== tickSign && scope.matrix[1][1]== tickSign)){
                        window.alert("you won");
                    }
                }else if(scope.matrix[2][0]!='-' && i==2 && j==0){
                    if((scope.matrix[0][0]== tickSign && scope.matrix[1][0]== tickSign) || (scope.matrix[2][1]== tickSign && scope.matrix[2][2]== tickSign) || (scope.matrix[1][1]== tickSign && scope.matrix[2][2]== tickSign)){
                        window.alert("you won");
                    }
                }
        }
    }
    $scope.initGame = function(){
        if(!$localStorage.userData){
            $scope.promptUer = true;
        }
    }
    $scope.setUser = function(user){
        $localStorage.userData = $scope.user;
        $localStorage.userData.matrix = $scope.matrix;
        createPubNubNSubscribe($scope,$localStorage);
        startTransmitting($scope,$localStorage);
        $scope.promptUer = false;
    }
    $scope.logout = function(){
        delete $localStorage.userData;
        $scope.promptUer = false;
        $window.location.reload();
    }
    $scope.assignBox = function(value,i,j){
        console.log($scope.matrix)
        //playSound();
        setupValue($scope,$localStorage,value,i,j)
        startTransmitting($scope,$localStorage,value,i,j);
    }
    
    function setupValue($scope,$localStorage,value,ii,jj){
        if($scope.matrix[ii][jj] =='-'){
            $scope.matrix[ii][jj] = $localStorage.userData.sign;
            $localStorage.userData.matrix[ii][jj] = $localStorage.userData.sign;
        }else{
            console.log($scope.matrix[ii][jj]);
        }
    }
    function playSound(){
        var audio = document.getElementById("audio");
        audio.play();
    }
    
    function startTransmitting(scope,localStorage,value,i,j) {
        // Creating instance of PubShub
        var publishConfig = {
            channel : "hello_world",
            message: {
                title       : "Hi",
                description : "Nothing !",
                user        :localStorage.userData,
                scopeMatrix :$scope.matrix,
                boxValue    :$localStorage.userData.sign,
                boxIdentity:[i,j]
            }
        }
        pubnub.publish(publishConfig, function(status, response) {
            console.log(status);
        })
    };
    
}]);

