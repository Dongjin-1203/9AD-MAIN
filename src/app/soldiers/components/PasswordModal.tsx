import { Button, Divider, Modal } from 'antd';

export type PasswordModalProps = {
  password?: string | null;
  onClose?: () => void;
};
export function PasswordModal({ password, onClose }: PasswordModalProps) {
  return (
    <Modal
      open={password != null}
      title='비밀번호 초기화'
      cancelText={null}
      onCancel={onClose}
      footer={[
        <Button
          key='close'
          danger
          onClick={onClose}
        >
          닫기
        </Button>,
      ]}
    >
      <p>해당 사용자의 비밀번호를 초기화하였습니다</p>
      <Divider />
      <p className='text-red-400'>
        비밀번호는 사용자의 군번으로 초기화됩니다
      </p>
    </Modal>
  );
}
