const homePage = async(req,res)=>{
    res.render('index')
}

const dashboard = async(req,res)=>{
    if(req.cookies.role == "government"){
        res.render('dashboard',{title:"Government Dashboard"})
    }else if(req.cookies.role == "industry"){
        res.render('dashboard',{title:"Industry Dashboard"})
    }else{
        res.render('dashboard',{title:"Individual Dashboard"})
    }
}

const mark_co2 = async (req,res)=>{
    res.render('markCo2')
}

const report_co2 = async(req,res)=>{
    res.render('reportCo2')
}

const all_emission = async(req,res)=>{
    res.render('allEmission')
}

const transparent = async(req,res)=>{
    res.render('transparent')
}

const allowance = async(req,res)=>{
    res.render('allowance')
}

const buy_token = async (req,res)=>{
    res.render('buyToken')
}

const sell_token = async (req,res)=>{
    res.render('selltoken')
}

const marketplace = async(req,res)=>{
    res.render('marketplace')
}

const quiz_reward = async(req,res)=>{
    res.render('quiz')
}

const KYC = async (req,res)=>{
    res.render('KYCGoverment')
}

module.exports = {homePage, dashboard,mark_co2,report_co2,all_emission,transparent,allowance,buy_token,sell_token,marketplace, KYC, quiz_reward}
