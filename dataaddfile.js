const mongoose = require("mongoose");
import { useParams } from 'react-router-dom';
const dotenv = require("dotenv")
dotenv.config();
const URI = process.env.DB

// const data = [
//     {
//         "name": "C",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285161/tk7yzhbkcg7wlgqf0di2.png"
//     },
//     {
//         "name": "C++",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285274/vhxp4k6bkm6d1bsbmnsw.png"
//     },
//     {
//         "name": "Pearl",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285443/ec6ghkglc1gzyeeyadd4.png"
//     },
//     {
//         "name": "Kotlin",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285492/acd44fhbg388ol4jrd7m.png"
//     },
//     {
//         "name": "C#",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285588/xkwpobtbrnzr61ul5s48.webp"
//     },
//     {
//         "name": "Ruby",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285676/rim9yciu4szgpvlrrqek.jpg"
//     },
//     {
//         "name": "CSS",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285740/pqxvfx5zhkecahwm6zt3.png"
//     },
//     {
//         "name": "Data Structures and Algorithms",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285829/sgmxmzvb69hvprr1vwap.png"
//     },
//     {
//         "name": "Figma",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285869/gsohsnsv59cgoyhlio6x.png"
//     },
//     {
//         "name": "HTML",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285909/fip8hbullii8fu5e2tpw.webp"
//     },
//     {
//         "name": "Bootstrap",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709285972/ssmexaoz997jbyosisrf.jpg"
//     },
//     {
//         "name": "jQuery",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709286049/e8shkdrtdymvg25odfzj.png"
//     },
//     {
//         "name": "Java",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709286343/jy51yaotjmatni36czkp.png"
//     },
//     {
//         "name": "JavaScript",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709286395/ec5dqpzjjcq2x0evpmlo.png"
//     },
//     {
//         "name": "MongoDB",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709286463/iuqebvqepdybx4olwo4u.jpg"
//     },
//     {
//         "name": "MySql",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709287056/bxiqmeei7kfkxgjxuwuh.png"
//     },
//     {
//         "name": "NodeJS",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709287296/flkazqe6pw6eft4ri2rx.png"
//     },
//     {
//         "name": "Pandas",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709287540/t4k1jdyyd53qdgjyne0z.png"
//     },
//     {
//         "name": "php",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709287575/bhkfgjmnbz6kfsr8anzb.webp"
//     },
//     {
//         "name": "Python",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709287603/q6pzb0tu7q0rjaseya7d.png"
//     },
//     {
//         "name": "ReactJS",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709287643/p5wnhineowbhom9v6hbn.png"
//     },
//     {
//         "name": "AngularJS",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288104/eoyjcrysnfwptheawocz.png"
//     },
//     {
//         "name": "DevOps",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288143/g3fhijqenaunvc0gvyzs.png"
//     },
//     {
//         "name": "Machine Learning",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288204/vk9tx09nkelc2neqbobu.png"
//     },
//     {
//         "name": "GitHub",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288246/xyg5rcbc9vajvuz5lmil.png"
//     },
//     {
//         "name": "WordPress",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288614/xvs4skk6hzjjfmmfqfis.png"
//     },
//     {
//         "name": "Spring Boot",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288661/uk7nsrcvpnyxbaspujfo.png"
//     },
//     {
//         "name": "Microservices",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288701/ebcu13iyvhrtwxgrv9we.png"
//     },
//     {
//         "name": "Docker",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288732/ejg0bdvubajqe8kfnj8c.png"
//     },
//     {
//         "name": "Type Script",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288835/vf95bk20rptzbcvd9w3q.png"
//     },
//     {
//         "name": "Django",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288869/z5gij8wxdplsm2o4qnqe.png"
//     },
//     {
//         "name": "Redux Framework",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288918/kr2iab9bzffqt75y5yvg.png"
//     },
//     {
//         "name": "Oracle SQL",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709288978/izhj3px184riiy9f0lfs.png"
//     },
//     {
//         "name": "PL-SQL",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289016/hw88q5xsorca8ypn6fvb.png"
//     },
//     {
//         "name": "Microsoft Powe BI",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289090/attwnfign5zwqdy4uuo6.jpg"
//     },
//     {
//         "name": "Oracle Database",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289155/uferhgix2z6uoj9sh5f6.png"
//     },
//     {
//         "name": "Deep Learning",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289210/u5paf1c9yesaroqwsxv5.jpg"
//     },
//     {
//         "name": "chatGPT",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289242/len6irk4nhnjmh2zxpiw.jpg"
//     },
//     {
//         "name": "Artificial Intelligence",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289309/p4i0c392a6efqqaf6mev.jpg"
//     },
//     {
//         "name": "Data Analysis",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289349/arnr2lm2hktmxeaen0i5.png"
//     },
//     {
//         "name": "Google Flutter",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289388/aqh1k4tx5culveejuwti.png"
//     },
//     {
//         "name": "Android development",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289424/zu8hgbfehwjfjnq7uvri.jpg"
//     },
//     {
//         "name": "App development",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289459/udjtpozhdkgkqifawkts.jpg"
//     },
//     {
//         "name": "ios development",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289544/wvb0rbjtcyknyadzuqf3.png"
//     },
//     {
//         "name": "Mobile App development",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289603/xxfwxq56qt9ldil1mrsi.jpg"
//     },
//     {
//         "name": "Software Testing",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289651/zhvkbzvvot1jfw45yn63.png"
//     },
//     {
//         "name": "Automation Testing",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289685/p4tmvpgmmcavbz4wsuuh.jpg"
//     },
//     {
//         "name": "postman",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289722/k0rv4hts7mm9hloaoawg.png"
//     },
//     {
//         "name": "Jira",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289760/v0kkp5bpowjewcxzef1v.png"
//     },
//     {
//         "name": "Web development",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289839/xfzzregfzfssshknemed.png"
//     },
//     {
//         "name": "Cyber Security",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289881/fguhks2j8i5jux2jtslj.png"
//     },
//     {
//         "name": "Amazon AWS",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289923/lar4dm1pfcgtfahitsyg.png"
//     },
//     {
//         "name": "Linux",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709289988/pir5v78oycs5vydl9uut.jpg"
//     },
//     {
//         "name": "Excel",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709290022/pyqjex7oizjqoku6jkkp.png"
//     },
//     {
//         "name": "Microsoft Azure",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709290071/zorejocxissu8zfyvlnu.png"
//     },
//     {
//         "name": "VMware",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709615899/rtswhdnf24bnfcabvtbf.png"
//     },
//     {
//         "name": "Citrix",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709615933/hl2hu8ssfxyxugjlg1cy.png"
//     },
//     {
//         "name": "AWS cloud practitioner",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709616090/fhgx4qcofwulrktnxo5p.png"
//     },
//     {
//         "name": "Networking Fundamentals",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709616194/zpjkhve1hurf3xkn3ovm.png"
//     },
//     {
//         "name": "AZ-104 Microsoft Azure Administartor",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709616518/venzj0gz2mp7wbf4owrj.png"
//     },
//     {
//         "name": "AZ-900 Microsoft Azure Fundamental",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709616693/ijipewfxpquieo8hrhut.png"
//     },
//     {
//         "name": "Commvault",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709616737/tchuhlva4hcbo1pivd0k.png"
//     },
//     {
//         "name": "Veem Certified Engineer",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709616789/l7iwr4hznnfrdte2awdg.png"
//     },
//     {
//         "name": "Google Cloud Platform",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709616852/suy1lyoz3n3v2mofjgzk.png"
//     },
//     {
//         "name": "kubernetes",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709616943/acvbft8lvs5z83motl9b.png"
//     },
//     {
//         "name": "Rhino 7",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709617027/qbjv0qdiyyaivwadvksw.png"
//     },
//     {
//         "name": "Enscape for Rhino 7",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709617091/xacabwqvc46kxkaesiwj.png"
//     },
//     {
//         "name": "Lumion 3D",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709617134/p2vsiukxjsbiz1t5xdac.png"
//     },
//     {
//         "name": "Twinmotion",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709617196/pswpem7jy7juxwf5vxib.png"
//     },
//     {
//         "name": "Keyshot",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709617226/qdi85jzxhunwdmdabswc.png"
//     },
//     {
//         "name": "Unreal Engine",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709617271/cb7w9jqyocbaeq97rgae.png"
//     },
//     {
//         "name": "Blender",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709617657/rlhodu18ch5ny6swt8m5.png"
//     },
//     {
//         "name": "Bluebeam",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709617712/qj3ilznuxgs0crgx3syp.png"
//     },
//     {
//         "name": "Agile Methodology",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709617954/krw0tdgiirwu7rzrxels.png"
//     },
//     {
//         "name": "Unix",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709618086/h4jdtprns6ipx1zazoqc.png"
//     },
//     {
//         "name": "RPA and Analytics",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709618281/s2v4i3gkdy83lzfxw2yw.png"
//     },
//     {
//         "name": "Service Now and ITIL",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709618469/pkzgu7atnvtiqpnarpog.png"
//     },
//     {
//         "name": "OAC\n",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709618585/m5oemlr7tvrbhcvfqpac.png"
//     },
//     {
//         "name": "APEX",
//         "image": "http://res.cloudinary.com/dplyhp3s9/image/upload/v1709618641/pghwk6jspklwpld0bd3o.png"
//     }
// ]
// const data=[
   
//         {
//             "City": "SGM",
//             "State": "Rajasthan",
//             "District": "Ganganagar"
//         },
//         {
//             "City": "STR",
//             "State": "Rajasthan",
//             "District": "Ganganagar"
//         },
//         {
//             "City": "A.Thirumuruganpoondi",
//             "State": "Tamil Nadu",
//             "District": "Coimbatore"
//         },
//         {
//             "City": "A.Vellalapatti",
//             "State": "Tamil Nadu",
//             "District": "Madurai"
//         },

    
// ]
mongoose.connect(URI)
    .then(() => {
        console.log(`Connected to MongoDB at`);
    })


const skillsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    image: {
        type: String,
    }
})
const skill = mongoose.model('Skills', skillsSchema)

// const citesSchema=new mongoose.Schema({

//         City:{
//             type:String
//         },
//         State:{
//             type:String
//         },
//         District:{
//             type:String
//         }

// })


// const cites=module.exports=mongoose.model("Cites",citesSchema)

// skill.insertMany(data)

console.log('done intersation')




