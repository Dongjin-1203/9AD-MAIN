import { Button, List, Modal } from 'antd';

export type HelpModalProps = {
  shown?: boolean;
  onPressClose?: () => void;
};

export function HelpModal({ shown, onPressClose }: HelpModalProps) {
  return (
    <Modal
      open={shown}
      title='도움말'
      cancelText={null}
      onCancel={onPressClose}
      style={{ maxHeight: '20vh' }}
      footer={[
        <Button
          key='close'
          danger
          onClick={onPressClose}
        >
          닫기
        </Button>,
      ]}
    >
      <List
        dataSource={[
          'Admin 계정의 정보 변경(예: 권한)이 필요할 경우, 웹사이트 관리자에게 문의해주세요',
          '군번, 유형, 이름은 수정할 수 없습니다. 수정이 필요한 경우 웹사이트 관리자에게 문의해주세요',
          '권한이 Admin으로 승격이 필요한 경우, 웹사이트 관리자에게 문의해주세요',
          'Commander 권한은 Admin만 임명할 수 있습니다.',
        ]}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    </Modal>
  );
}
