// eslint-disable-next-line import/no-webpack-loader-syntax
import "!style-loader!css-loader!less-loader?{'lessOptions':{'javascriptEnabled':true}}!./antd-overrides.less";
import { Button, Input, Space, Typography } from "antd";

function App() {
  return (
    <>
      <Typography.Title>Customize antd without hassle</Typography.Title>
      <div style={{ marginLeft: "2em" }}>
        <Space direction="vertical">
          <Input style={{ width: "250px" }} />
          <Button type="primary">This is a button</Button>
        </Space>
      </div>
    </>
  );
}

export default App;
