const{ONE_SIGNAL_CONFIG}=require('./app.config');
const pushNotificationService = require('./pushNotificationService');

exports.sendNotification =(req, res,next) => {
    const message = req.body.message;
    const data = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {"en": message},
        included_segments: ["All"],
        content_available: true,
        data:{
            pushTitle:"New Notification",
        }

    };
    pushNotificationService.sendNotification(data,(err,result)=>{
        if(err){
            return next(err);
        }else{
            res.status(200).json({message:"Notification sent successfully",result:result});
        }
    });
};

exports.sendNotificationToDevice =(req, res,next) => {
    const message = req.body.message;
    const playerId = req.body.playerId;
    const data = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {"en": message},
        include_player_ids: [playerId],
        content_available: true,
        data:{
            pushTitle:"New Single Notification",
        }

    };
    pushNotificationService.sendNotification(data,(err,result)=>{
        if(err){
            return next(err);
        }else{
            res.status(200).json({message:"Notification sent successfully",result:result});
        }
    });
   
};