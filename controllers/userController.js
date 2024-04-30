const loadIndex = async (req,res) => {
    try{
        res.render('index')
    }catch(err){
        console.log(err.message)
    }
}

export default {
    loadIndex
}