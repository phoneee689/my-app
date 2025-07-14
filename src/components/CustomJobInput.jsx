
import React, { useState } from "react";
import { Form, Input, Select, Button, Card, Spin, Alert, Typography, List } from "antd";
import "antd/dist/antd.css";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CustomJobInput = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cvRecommendations, setCvRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form] = Form.useForm();

  const API_BASE = "http://localhost:3000/api/v1";

  const convertFormToJobData = (values) => {
    return {
      title: values.title,
      company: values.company,
      location: values.location,
      jobType: values.jobType,
      salaryRange: values.salaryRange,
      experience: values.experience,
      education: values.education,
      description: values.description,
      requirements: values.requirements,
      benefits: values.benefits,
      skills: values.skills ? values.skills.split(",").map((s) => s.trim()) : [],
      industry: values.industry,
    };
  };

  const submitJobData = async (values) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    setCvRecommendations([]);

    try {
      const jobData = convertFormToJobData(values);

      if (!jobData.title || jobData.title.trim() === "") {
        throw new Error("Vui lòng nhập tên công việc");
      }
      if (
        !jobData.skills ||
        (Array.isArray(jobData.skills) && jobData.skills.length === 0)
      ) {
        throw new Error("Vui lòng nhập ít nhất một kỹ năng yêu cầu");
      }
      if (!jobData.requirements || jobData.requirements.trim() === "") {
        throw new Error("Vui lòng nhập yêu cầu ứng viên");
      }

      setSuccess("🔄 Đang khởi tạo hệ thống...");

      const statusResponse = await fetch(
        `${API_BASE}/recommendation/model-status`
      );
      const statusResult = await statusResponse.json();

      if (!statusResult.data.isModelBuilt) {
        setSuccess("🔄 Đang xây dựng mô hình AI...");
        const buildResponse = await fetch(
          `${API_BASE}/recommendation/build-model`,
          { method: "POST" }
        );

        if (!buildResponse.ok) {
          throw new Error("Không thể xây dựng mô hình AI");
        }

        const buildResult = await buildResponse.json();
        if (!buildResult.success) {
          throw new Error("Lỗi khi xây dựng mô hình");
        }
      }

      setSuccess("🔄 Đang phân tích và tìm kiếm CV phù hợp...");

      const response = await fetch(
        `${API_BASE}/recommendation/cvs-for-custom-job?limit=20`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setCvRecommendations(result.data.recommendations || []);
        setSuccess(
          `✅ Thành công! Tìm thấy ${
            result.data.recommendations?.length || 0
          } CV phù hợp từ ${result.data.totalCVsAnalyzed || 0} CV trong hệ thống`
        );
      } else {
        throw new Error(result.error || "Không thể tìm kiếm CV");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(`❌ Lỗi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <Title level={2} className="text-center mb-4">
          💼 Tìm CV cho Công việc
        </Title>
        <Paragraph className="text-center text-gray-600 mb-6">
          HR nhập thông tin công việc để tìm CV phù hợp nhất trong hệ thống
        </Paragraph>

        <Form
          form={form}
          layout="vertical"
          onFinish={submitJobData}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Form.Item
            label="Tên công việc"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tên công việc" }]}
          >
            <Input placeholder="vd: Senior Frontend Developer" />
          </Form.Item>

          <Form.Item label="Công ty" name="company">
            <Input placeholder="vd: Tech Company ABC" />
          </Form.Item>

          <Form.Item label="Địa điểm" name="location">
            <Input placeholder="vd: Hồ Chí Minh" />
          </Form.Item>

          <Form.Item label="Loại công việc" name="jobType" initialValue="Full-time">
            <Select>
              <Option value="Full-time">Full-time</Option>
              <Option value="Part-time">Part-time</Option>
              <Option value="Contract">Contract</Option>
              <Option value="Internship">Internship</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Mức lương" name="salaryRange">
            <Input placeholder="vd: 25-35 triệu VND" />
          </Form.Item>

          <Form.Item label="Kinh nghiệm yêu cầu" name="experience">
            <Input placeholder="vd: 3+ năm kinh nghiệm" />
          </Form.Item>

          <Form.Item
            label="Kỹ năng yêu cầu (phân cách bằng dấu phẩy)"
            name="skills"
            rules={[{ required: true, message: "Vui lòng nhập ít nhất một kỹ năng" }]}
            className="col-span-1 md:col-span-2"
          >
            <Input placeholder="vd: JavaScript, React, Vue.js, HTML, CSS" />
          </Form.Item>

          <Form.Item label="Ngành nghề" name="industry" className="col-span-1 md:col-span-2">
            <Input placeholder="vd: Information Technology" />
          </Form.Item>

          <Form.Item label="Mô tả công việc" name="description" className="col-span-1 md:col-span-2">
            <TextArea rows={4} placeholder="Mô tả chi tiết về công việc..." />
          </Form.Item>

          <Form.Item
            label="Yêu cầu ứng viên"
            name="requirements"
            rules={[{ required: true, message: "Vui lòng nhập yêu cầu ứng viên" }]}
            className="col-span-1 md:col-span-2"
          >
            <TextArea rows={4} placeholder="Các yêu cầu cụ thể cho ứng viên..." />
          </Form.Item>

          <Form.Item label="Quyền lợi" name="benefits" className="col-span-1 md:col-span-2">
            <TextArea rows={3} placeholder="Các quyền lợi và phúc lợi cho nhân viên..." />
          </Form.Item>

          <Form.Item className="col-span-1 md:col-span-2 text-center">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              className="bg-green-500 hover:bg-green-600"
            >
              {isLoading ? "Đang xử lý..." : "🔍 Tìm CV phù hợp"}
            </Button>
          </Form.Item>
        </Form>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mt-4 max-w-md mx-auto"
          />
        )}
        {success && (
          <Alert
            message={success}
            type="success"
            showIcon
            className="mt-4 max-w-md mx-auto"
          />
        )}

        {isLoading && (
          <div className="text-center mt-6">
            <Spin size="large" />
          </div>
        )}

        {cvRecommendations.length > 0 && (
          <div className="mt-8">
            <Title level={3} className="text-center">
              👥 CV phù hợp được tìm thấy ({cvRecommendations.length})
            </Title>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={cvRecommendations}
              renderItem={(cv, index) => (
                <List.Item>
                  <Card className="shadow-md">
                    <div className="flex justify-between items-center">
                      <Title level={4} className="m-0">
                        👤 {cv.cvOwner || "Chưa có tên"}
                      </Title>
                      <span className="text-green-500">#{index + 1}</span>
                    </div>
                    <Paragraph>
                      <strong>🆔 CV ID:</strong> {cv.cvId}
                    </Paragraph>
                    <div className="bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: `${cv.score * 100}%` }}
                      ></div>
                    </div>
                    <Paragraph className="text-sm text-gray-600">
                      Độ phù hợp: {(cv.score * 100).toFixed(1)}%
                    </Paragraph>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}

        {!isLoading && cvRecommendations.length === 0 && success && !error && (
          <Alert
            message="Không tìm thấy CV phù hợp. Thử điều chỉnh các yêu cầu hoặc kỹ năng."
            type="info"
            showIcon
            className="mt-4 max-w-md mx-auto"
          />
        )}
      </Card>
    </div>
  );
};

export default CustomJobInput;
