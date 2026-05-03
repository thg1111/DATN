using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BLL;
using BLL.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Model;
using static IdentityModel.OidcConstants;


namespace Dahla_NguoiDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController:ControllerBase
    {
        private bll_Feedback fbBus;
        public FeedbackController(bll_Feedback feedback) 
        { 
            fbBus = feedback;
        }
        [Route("feedback-create")]
        [HttpPost]
        public Feedback_Model Create(Feedback_Model model)
        {
            fbBus.Create(model);
            return model;
        }
        [Route("get-all-feedback")]
        [HttpGet]
        public IEnumerable<Feedback_Model> GetDatabAll()
        {
            return fbBus.GetDataAll();
        }
        [Route("Delete/{FeedbackID}")]
        [HttpDelete]
        public bool Delete(string FeedbackID)
        {
            return fbBus.Delete(FeedbackID);
        }
    }

}
